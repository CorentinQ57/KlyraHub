-- Tables pour l'Academy
-- Créer les tables courses et resources

-- Table des cours
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  level TEXT CHECK (level IN ('Débutant', 'Intermédiaire', 'Avancé')),
  duration TEXT,
  lessons INTEGER DEFAULT 0,
  image_url TEXT,
  is_popular BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des ressources
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('eBook', 'Vidéo', 'Template', 'Checklist')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  download_link TEXT,
  is_popular BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer la sécurité au niveau des lignes
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Politiques pour courses
CREATE POLICY "Courses are viewable by everyone"
  ON courses FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert courses"
  ON courses FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can update courses"
  ON courses FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete courses"
  ON courses FOR DELETE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Politiques pour resources
CREATE POLICY "Resources are viewable by everyone"
  ON resources FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert resources"
  ON resources FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can update resources"
  ON resources FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete resources"
  ON resources FOR DELETE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Triggers pour updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Données de test pour cours
INSERT INTO courses (title, description, level, duration, lessons, is_popular, is_new, tags)
VALUES
  ('Fondamentaux du Branding Digital', 'Apprenez à créer une identité de marque cohérente dans l''environnement numérique.', 'Débutant', '3 heures', 8, true, false, ARRAY['branding', 'design', 'identité']),
  ('Design d''Interface Avancé', 'Maîtrisez les techniques de design d''interface moderne et attrayante.', 'Avancé', '5 heures', 12, false, true, ARRAY['ui', 'interface', 'design']),
  ('Stratégie de Contenu Web', 'Développez une stratégie de contenu efficace pour votre site web.', 'Intermédiaire', '4 heures', 10, true, false, ARRAY['contenu', 'web', 'stratégie']);

-- Données de test pour ressources
INSERT INTO resources (title, description, type, is_popular, is_new)
VALUES
  ('Guide complet du Branding pour Startups', 'Un ebook complet sur la création d''une marque forte pour les startups.', 'eBook', true, false),
  ('Template de Design System', 'Un template prêt à l''emploi pour créer votre design system.', 'Template', false, true),
  ('Checklist SEO pour sites modernes', 'Une checklist complète des optimisations SEO pour sites web modernes.', 'Checklist', true, false);

-- Mettre à jour les images des ressources et des cours
UPDATE courses
SET image_url = 'https://ecfccsjjfrweqzhkveku.supabase.co/storage/v1/object/public/academy-images/courses/branding-course.jpg'
WHERE title = 'Fondamentaux du Branding Digital';

UPDATE resources
SET image_url = 'https://ecfccsjjfrweqzhkveku.supabase.co/storage/v1/object/public/academy-images/resources/branding-ebook.jpg'
WHERE title = 'Guide complet du Branding pour Startups'; 