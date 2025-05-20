-- Migration pour ajouter une politique permettant aux administrateurs de créer des projets
-- pour n'importe quel client, pas seulement pour eux-mêmes

-- Création d'une fonction utilitaire pour vérifier l'existence d'une politique
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

-- Ajout d'une colonne admin_created à la table projects si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'admin_created') THEN
    ALTER TABLE public.projects ADD COLUMN admin_created BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Création de la politique pour permettre aux administrateurs de créer des projets pour n'importe quel client
DO $$ 
BEGIN
  IF NOT policy_exists('Admins can create projects for any client', 'projects') THEN
    CREATE POLICY "Admins can create projects for any client" 
      ON public.projects FOR INSERT 
      WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- Mise à jour de la politique existante pour permettre aux administrateurs de voir tous les projets
DO $$ 
BEGIN
  IF NOT policy_exists('Projects are viewable by involved users and admins', 'projects') THEN
    CREATE POLICY "Projects are viewable by involved users and admins" 
      ON public.projects FOR SELECT 
      USING (
          auth.uid() = client_id 
          OR auth.uid() = designer_id 
          OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
      );
  END IF;
END $$; 