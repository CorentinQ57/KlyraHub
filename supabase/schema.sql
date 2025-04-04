-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up existing tables if they exist
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS deliverables;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS profiles;

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'cancelled')),
    price DECIMAL(10,2) NOT NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    designer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comments table
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create deliverables table
CREATE TABLE deliverables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'approved', 'rejected')),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create functions for managing updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_deliverables_updated_at
    BEFORE UPDATE ON deliverables
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Create Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert categories"
    ON categories FOR INSERT
    WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can update categories"
    ON categories FOR UPDATE
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete categories"
    ON categories FOR DELETE
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Services policies
CREATE POLICY "Services are viewable by everyone"
    ON services FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert services"
    ON services FOR INSERT
    WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can update services"
    ON services FOR UPDATE
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete services"
    ON services FOR DELETE
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Projects policies
CREATE POLICY "Projects are viewable by involved users and admins"
    ON projects FOR SELECT
    USING (
        auth.uid() = client_id 
        OR auth.uid() = designer_id 
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Authenticated users can create projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Projects can be updated by involved users and admins"
    ON projects FOR UPDATE
    USING (
        auth.uid() = client_id 
        OR auth.uid() = designer_id 
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Only admins can delete projects"
    ON projects FOR DELETE
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Comments policies
CREATE POLICY "Comments are viewable by project members and admins"
    ON comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = comments.project_id 
            AND (
                client_id = auth.uid() 
                OR designer_id = auth.uid()
                OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
            )
        )
    );

CREATE POLICY "Authenticated users can insert comments on their projects"
    ON comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_id 
            AND (
                client_id = auth.uid() 
                OR designer_id = auth.uid()
                OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
            )
        )
    );

CREATE POLICY "Users can update their own comments"
    ON comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Only comment owners and admins can delete comments"
    ON comments FOR DELETE
    USING (
        auth.uid() = user_id 
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

-- Deliverables policies
CREATE POLICY "Deliverables are viewable by project members and admins"
    ON deliverables FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = deliverables.project_id 
            AND (
                client_id = auth.uid() 
                OR designer_id = auth.uid()
                OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
            )
        )
    );

CREATE POLICY "Only designers and admins can insert deliverables"
    ON deliverables FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_id 
            AND (
                designer_id = auth.uid()
                OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
            )
        )
    );

CREATE POLICY "Only designers and admins can update deliverables"
    ON deliverables FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_id 
            AND (
                designer_id = auth.uid()
                OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
            )
        )
    );

CREATE POLICY "Only admins can delete deliverables"
    ON deliverables FOR DELETE
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Insert initial data
INSERT INTO categories (name, description) VALUES
    ('Logo Design', 'Creation of unique and memorable logos'),
    ('Web Design', 'Modern and responsive website designs'),
    ('Brand Identity', 'Complete brand identity packages'),
    ('UI/UX Design', 'User interface and experience design'),
    ('Print Design', 'Design for physical printing materials');

INSERT INTO services (name, description, price, category_id) VALUES
    ('Basic Logo Package', 'Simple logo design with 2 revisions', 499.99, (SELECT id FROM categories WHERE name = 'Logo Design')),
    ('Premium Logo Package', 'Advanced logo design with unlimited revisions', 999.99, (SELECT id FROM categories WHERE name = 'Logo Design')),
    ('Basic Website Design', 'Simple 5-page website design', 1499.99, (SELECT id FROM categories WHERE name = 'Web Design')),
    ('E-commerce Website', 'Complete online store design', 2999.99, (SELECT id FROM categories WHERE name = 'Web Design')),
    ('Complete Brand Package', 'Full brand identity including logo, colors, and guidelines', 2499.99, (SELECT id FROM categories WHERE name = 'Brand Identity')),
    ('Mobile App UI Design', 'User interface design for mobile applications', 1999.99, (SELECT id FROM categories WHERE name = 'UI/UX Design')),
    ('Business Card Design', 'Professional business card design', 199.99, (SELECT id FROM categories WHERE name = 'Print Design'));

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, email)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url',
        new.email
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 