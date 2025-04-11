-- Create profiles table to store user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'designer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_sign_in_at TIMESTAMP WITH TIME ZONE
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL, -- in days
  category_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.profiles(id) NOT NULL,
  designer_id UUID REFERENCES public.profiles(id),
  service_id UUID REFERENCES public.services(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'in_progress', 'delivered', 'completed')),
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create deliverables table
CREATE TABLE IF NOT EXISTS public.deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  read_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE
);

-- Create RLS (Row Level Security) policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if a policy exists before creating it
CREATE OR REPLACE FUNCTION policy_exists(policy_name text, table_name text) 
RETURNS boolean AS $$
DECLARE
  exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = policy_name 
    AND tablename = table_name
  ) INTO exists;
  
  RETURN exists;
END;
$$ LANGUAGE plpgsql;

-- Profiles policies
DO $$ 
BEGIN
  IF NOT policy_exists('Profiles are viewable by users who created them and admins', 'profiles') THEN
    CREATE POLICY "Profiles are viewable by users who created them and admins" 
      ON public.profiles FOR SELECT 
      USING ((auth.uid() = id) OR (auth.jwt() ->> 'role' = 'admin'));
  END IF;
  
  IF NOT policy_exists('Profiles can be updated by the user or admins', 'profiles') THEN
    CREATE POLICY "Profiles can be updated by the user or admins" 
      ON public.profiles FOR UPDATE 
      USING ((auth.uid() = id) OR (auth.jwt() ->> 'role' = 'admin'));
  END IF;
END $$;

-- Categories policies
DO $$ 
BEGIN
  IF NOT policy_exists('Categories are viewable by everyone', 'categories') THEN
    CREATE POLICY "Categories are viewable by everyone" 
      ON public.categories FOR SELECT 
      USING (TRUE);
  END IF;
  
  IF NOT policy_exists('Categories can be modified by admins', 'categories') THEN
    CREATE POLICY "Categories can be modified by admins" 
      ON public.categories FOR INSERT 
      WITH CHECK ((auth.jwt() ->> 'role' = 'admin'));
  END IF;
  
  IF NOT policy_exists('Categories can be updated by admins', 'categories') THEN
    CREATE POLICY "Categories can be updated by admins" 
      ON public.categories FOR UPDATE 
      USING ((auth.jwt() ->> 'role' = 'admin'));
  END IF;
END $$;

-- Services policies
DO $$ 
BEGIN
  IF NOT policy_exists('Services are viewable by everyone', 'services') THEN
    CREATE POLICY "Services are viewable by everyone" 
      ON public.services FOR SELECT 
      USING (TRUE);
  END IF;
  
  IF NOT policy_exists('Services can be created by admins', 'services') THEN
    CREATE POLICY "Services can be created by admins" 
      ON public.services FOR INSERT 
      WITH CHECK ((auth.jwt() ->> 'role' = 'admin'));
  END IF;
  
  IF NOT policy_exists('Services can be updated by admins', 'services') THEN
    CREATE POLICY "Services can be updated by admins" 
      ON public.services FOR UPDATE 
      USING ((auth.jwt() ->> 'role' = 'admin'));
  END IF;
END $$;

-- Projects policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Projects are viewable by the client who created them') THEN
    CREATE POLICY "Projects are viewable by the client who created them" 
      ON public.projects FOR SELECT 
      USING (auth.uid() = client_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Projects can be created by authenticated users') THEN
    CREATE POLICY "Projects can be created by authenticated users" 
      ON public.projects FOR INSERT 
      WITH CHECK (auth.uid() = client_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Projects can be updated by the client who created them') THEN
    CREATE POLICY "Projects can be updated by the client who created them" 
      ON public.projects FOR UPDATE 
      USING (auth.uid() = client_id);
  END IF;
END $$;

-- Comments policies
DO $$ 
BEGIN
  IF NOT policy_exists('Comments are viewable by project participants', 'comments') THEN
    CREATE POLICY "Comments are viewable by project participants" 
      ON public.comments FOR SELECT 
      USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_id AND (auth.uid() = projects.client_id OR auth.uid() = projects.designer_id OR auth.jwt() ->> 'role' = 'admin')));
  END IF;
  
  IF NOT policy_exists('Comments can be created by project participants', 'comments') THEN
    CREATE POLICY "Comments can be created by project participants" 
      ON public.comments FOR INSERT 
      WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_id AND (auth.uid() = projects.client_id OR auth.uid() = projects.designer_id OR auth.jwt() ->> 'role' = 'admin')));
  END IF;
END $$;

-- Deliverables policies
DO $$ 
BEGIN
  IF NOT policy_exists('Deliverables are viewable by project participants', 'deliverables') THEN
    CREATE POLICY "Deliverables are viewable by project participants" 
      ON public.deliverables FOR SELECT 
      USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_id AND (auth.uid() = projects.client_id OR auth.uid() = projects.designer_id OR auth.jwt() ->> 'role' = 'admin')));
  END IF;
  
  IF NOT policy_exists('Deliverables can be created by designers and admins', 'deliverables') THEN
    CREATE POLICY "Deliverables can be created by designers and admins" 
      ON public.deliverables FOR INSERT 
      WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_id AND (auth.uid() = projects.designer_id OR auth.jwt() ->> 'role' = 'admin')));
  END IF;
  
  IF NOT policy_exists('Deliverables can be deleted by designers and admins', 'deliverables') THEN
    CREATE POLICY "Deliverables can be deleted by designers and admins" 
      ON public.deliverables FOR DELETE 
      USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_id AND (auth.uid() = projects.designer_id OR auth.jwt() ->> 'role' = 'admin')));
  END IF;
END $$;

-- Contact messages policies
DO $$ 
BEGIN
  IF NOT policy_exists('Contact messages can be created by anyone', 'contact_messages') THEN
    CREATE POLICY "Contact messages can be created by anyone" 
      ON public.contact_messages FOR INSERT 
      WITH CHECK (TRUE);
  END IF;
  
  IF NOT policy_exists('Contact messages are viewable by admins', 'contact_messages') THEN
    CREATE POLICY "Contact messages are viewable by admins" 
      ON public.contact_messages FOR SELECT 
      USING ((auth.jwt() ->> 'role' = 'admin'));
  END IF;
  
  IF NOT policy_exists('Contact messages can be updated by admins', 'contact_messages') THEN
    CREATE POLICY "Contact messages can be updated by admins" 
      ON public.contact_messages FOR UPDATE 
      USING ((auth.jwt() ->> 'role' = 'admin'));
  END IF;
END $$;

-- Create trigger to update updated_at field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = TIMEZONE('utc', NOW());
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers only if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_services_updated_at'
  ) THEN
    CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON public.services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_projects_updated_at'
  ) THEN
    CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON public.projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_deliverables_updated_at'
  ) THEN
    CREATE TRIGGER update_deliverables_updated_at 
    BEFORE UPDATE ON public.deliverables 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, 
          COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nouvel utilisateur'), 
          COALESCE(NEW.raw_user_meta_data->>'role', 'client'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when a new user is created (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Create default categories for testing
INSERT INTO public.categories (name) VALUES 
  ('Design Graphique'),
  ('Développement Web'),
  ('Branding'),
  ('UX/UI Design'),
  ('Stratégie Digitale')
ON CONFLICT DO NOTHING;

-- Create default services for testing
INSERT INTO public.services (name, description, price, duration, category_id, active) 
SELECT 
  'Logo Design', 
  'Création d''un logo professionnel et moderne pour votre entreprise.', 
  499.99, 
  7, 
  id, 
  TRUE
FROM public.categories 
WHERE name = 'Design Graphique'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.services (name, description, price, duration, category_id, active) 
SELECT 
  'Site Web Vitrine', 
  'Création d''un site web vitrine professionnel et responsive.', 
  1499.99, 
  21, 
  id, 
  TRUE
FROM public.categories 
WHERE name = 'Développement Web'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.services (name, description, price, duration, category_id, active) 
SELECT 
  'Identité de Marque Complète', 
  'Création d''une identité de marque complète incluant logo, charte graphique et outils de communication.', 
  2999.99, 
  30, 
  id, 
  TRUE
FROM public.categories 
WHERE name = 'Branding'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Create default admin user if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@klyra.com'
  ) THEN
    -- This is commented out because it requires the admin.create_user function
    -- which is only available in the Supabase Dashboard or API
    -- You should create the admin user manually through the Supabase Dashboard
    -- or using the Supabase client API
    
    -- INSERT INTO auth.users (email, password, email_confirmed_at, role)
    -- VALUES ('admin@klyra.com', 'your-secure-password', NOW(), 'admin');
    
    -- INSERT INTO public.profiles (id, email, full_name, role)
    -- SELECT id, email, 'Admin Klyra', 'admin'
    -- FROM auth.users WHERE email = 'admin@klyra.com';
    NULL;
  END IF;
END
$$; 