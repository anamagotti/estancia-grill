-- Tabela de itens do cardápio
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT, -- Para 'Churrasco': 'pre-assada', 'in-natura', 'sobra'
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas de segurança (RLS)
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Política para leitura (permitir que qualquer usuário autenticado leia)
CREATE POLICY "Users can read menu items" ON public.menu_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para escrita (permitir que apenas admins/superusers escrevam - por enquanto simplificado para authenticated para facilitar uso no app se todos forem staff)
CREATE POLICY "Users can insert menu items" ON public.menu_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update menu items" ON public.menu_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete menu items" ON public.menu_items
  FOR DELETE USING (auth.role() = 'authenticated');
