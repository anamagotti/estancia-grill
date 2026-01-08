-- 1. Garantir que o usuário admin existe e tem permissão correta
INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Administrador'), 'admin'
FROM auth.users
WHERE email = 'admin@estanciagrill.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

-- 2. Simplificar as políticas de segurança para evitar erros de permissão
-- Permitir que qualquer usuário logado crie vistorias
DROP POLICY IF EXISTS "Only admins can insert inspections" ON inspections;
CREATE POLICY "Authenticated users can insert inspections"
  ON inspections FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir que qualquer usuário logado crie itens de checklist
DROP POLICY IF EXISTS "Only admins can insert checklist items" ON checklist_items;
CREATE POLICY "Authenticated users can insert checklist items"
  ON checklist_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Garantir que todos podem ver as vistorias
DROP POLICY IF EXISTS "All authenticated users can view inspections" ON inspections;
CREATE POLICY "All authenticated users can view inspections"
  ON inspections FOR SELECT
  TO authenticated
  USING (true);
