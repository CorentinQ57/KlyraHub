-- Add start_date and deadline_date fields to projects if they don't exist
DO $$ 
BEGIN 
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                WHERE table_name='projects' AND column_name='start_date') THEN
    ALTER TABLE public.projects 
    ADD COLUMN start_date TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                WHERE table_name='projects' AND column_name='deadline_date') THEN
    ALTER TABLE public.projects 
    ADD COLUMN deadline_date TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                WHERE table_name='projects' AND column_name='estimated_delivery_date') THEN
    ALTER TABLE public.projects 
    ADD COLUMN estimated_delivery_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$; 