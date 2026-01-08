-- Tabela para armazenar múltiplas fotos por item de checklist
CREATE TABLE IF NOT EXISTS public.checklist_item_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_item_id UUID NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_checklist_item_photos_item ON public.checklist_item_photos(checklist_item_id);

-- Habilitar RLS
ALTER TABLE public.checklist_item_photos ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Authenticated users can insert photos"
  ON public.checklist_item_photos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can select photos"
  ON public.checklist_item_photos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete photos"
  ON public.checklist_item_photos FOR DELETE
  TO authenticated
  USING (true);
