-- Ajout des colonnes à la table services
ALTER TABLE "public"."services" 
  ADD COLUMN IF NOT EXISTS "long_description" TEXT,
  ADD COLUMN IF NOT EXISTS "features" JSONB,
  ADD COLUMN IF NOT EXISTS "phases" JSONB;

-- Mise à jour des services existants pour initialiser ces colonnes
UPDATE "public"."services"
SET 
  "long_description" = "description",
  "features" = '[]'::JSONB,
  "phases" = '["Briefing", "Conception", "Développement", "Tests et validation", "Livraison"]'::JSONB
WHERE "long_description" IS NULL;

COMMENT ON COLUMN "public"."services"."long_description" IS 'Description détaillée du service';
COMMENT ON COLUMN "public"."services"."features" IS 'Liste des caractéristiques du service au format JSON';
COMMENT ON COLUMN "public"."services"."phases" IS 'Étapes du projet au format JSON';
