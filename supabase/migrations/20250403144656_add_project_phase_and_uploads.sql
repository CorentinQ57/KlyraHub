-- Ajout de la colonne current_phase à la table projects
ALTER TABLE "public"."projects"
  ADD COLUMN IF NOT EXISTS "current_phase" TEXT;

COMMENT ON COLUMN "public"."projects"."current_phase" IS 'Phase actuelle du projet';

-- Création de la table upload_requests pour les demandes de fichiers
CREATE TABLE IF NOT EXISTS "public"."upload_requests" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "project_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_by" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ,
  "file_url" TEXT,
  "uploaded_by" UUID,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE,
  FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
  FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "upload_requests_project_id_idx" ON "public"."upload_requests" ("project_id");

COMMENT ON TABLE "public"."upload_requests" IS 'Demandes de fichiers pour les projets';
COMMENT ON COLUMN "public"."upload_requests"."name" IS 'Nom de la demande de fichier';
COMMENT ON COLUMN "public"."upload_requests"."description" IS 'Description / Instructions pour le client';
COMMENT ON COLUMN "public"."upload_requests"."status" IS 'Statut: pending, completed, rejected';
COMMENT ON COLUMN "public"."upload_requests"."created_by" IS 'Utilisateur qui a créé la demande';
COMMENT ON COLUMN "public"."upload_requests"."file_url" IS 'URL du fichier téléchargé par le client';
COMMENT ON COLUMN "public"."upload_requests"."uploaded_by" IS 'Utilisateur qui a téléchargé le fichier';
