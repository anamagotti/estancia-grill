-- Adiciona coluna para distinguir fotos de antes e depois
ALTER TABLE public.checklist_item_photos
ADD COLUMN IF NOT EXISTS photo_type TEXT CHECK (photo_type IN ('before','after'));

-- Opcional: índice para consultas por tipo
CREATE INDEX IF NOT EXISTS idx_checklist_item_photos_type ON public.checklist_item_photos(photo_type);
