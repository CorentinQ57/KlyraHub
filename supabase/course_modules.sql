-- Tables pour les modules et leçons de cours
-- Ajouter à notre système de cours

-- Table des modules de cours
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  order INTEGER NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des leçons de cours
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  duration TEXT NOT NULL,
  video_url TEXT,
  type TEXT CHECK (type IN ('video', 'text', 'quiz')),
  order INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer la sécurité au niveau des lignes
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;

-- Politiques pour les modules
CREATE POLICY "Course modules are viewable by everyone"
  ON course_modules FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert course modules"
  ON course_modules FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can update course modules"
  ON course_modules FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete course modules"
  ON course_modules FOR DELETE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Politiques pour les leçons
CREATE POLICY "Course lessons are viewable by everyone"
  ON course_lessons FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert course lessons"
  ON course_lessons FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can update course lessons"
  ON course_lessons FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete course lessons"
  ON course_lessons FOR DELETE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Triggers pour updated_at
CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON course_modules
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON course_lessons
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Ajouter des données d'exemple pour le cours "Fondamentaux du Branding Digital"
DO $$
DECLARE
  course_id UUID;
  module1_id UUID;
  module2_id UUID;
  module3_id UUID;
BEGIN
  -- Récupérer l'ID du cours
  SELECT id INTO course_id FROM courses WHERE title = 'Fondamentaux du Branding Digital';
  
  IF course_id IS NOT NULL THEN
    -- Créer les modules
    INSERT INTO course_modules (title, description, order, course_id) 
    VALUES ('Introduction au Branding', 'Comprendre les bases du branding et son importance', 1, course_id)
    RETURNING id INTO module1_id;
    
    INSERT INTO course_modules (title, description, order, course_id) 
    VALUES ('Éléments d''identité visuelle', 'Créer une identité visuelle cohérente et impactante', 2, course_id)
    RETURNING id INTO module2_id;
    
    INSERT INTO course_modules (title, description, order, course_id) 
    VALUES ('Stratégie de marque digitale', 'Élaborer une stratégie de marque adaptée au contexte digital', 3, course_id)
    RETURNING id INTO module3_id;
    
    -- Ajouter les leçons au module 1
    INSERT INTO course_lessons (title, description, duration, type, order, is_free, module_id)
    VALUES 
      ('Qu''est-ce que le branding ?', 'Définition et principes fondamentaux du branding', '15-20 min', 'video', 1, true, module1_id),
      ('Importance du branding pour les entreprises', 'Pourquoi investir dans le branding est crucial', '20-25 min', 'video', 2, false, module1_id),
      ('Évolution du branding à l''ère digitale', 'Comment le digital a transformé les approches de branding', '25-30 min', 'video', 3, false, module1_id);
    
    -- Ajouter les leçons au module 2
    INSERT INTO course_lessons (title, description, duration, type, order, is_free, module_id)
    VALUES 
      ('Les fondamentaux du logo', 'Principes de conception d''un logo efficace', '20-25 min', 'video', 1, false, module2_id),
      ('Typographie et palette de couleurs', 'Choisir et utiliser la typographie et les couleurs dans votre identité', '25-30 min', 'video', 2, false, module2_id),
      ('Workshop : Créer votre moodboard', 'Exercice pratique pour définir l''univers visuel de votre marque', '30-35 min', 'text', 3, false, module2_id);
    
    -- Ajouter les leçons au module 3
    INSERT INTO course_lessons (title, description, duration, type, order, is_free, module_id)
    VALUES 
      ('Définir votre public cible digital', 'Techniques pour identifier et comprendre votre audience en ligne', '25-30 min', 'video', 1, false, module3_id),
      ('Storytelling de marque', 'Créer une histoire de marque engageante pour le web', '30-35 min', 'video', 2, false, module3_id),
      ('Quiz : Évaluation de stratégie', 'Testez vos connaissances en stratégie de marque digitale', '15-20 min', 'quiz', 3, false, module3_id);
  END IF;
END $$; 