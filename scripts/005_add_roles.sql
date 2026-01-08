-- Atualizar RLS policies para permitir apenas admins criar/editar vistorias
DROP POLICY IF EXISTS "Users can insert own inspections" ON inspections;
DROP POLICY IF EXISTS "Users can update own inspections" ON inspections;

CREATE POLICY "Only admins can insert inspections"
  ON inspections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update inspections"
  ON inspections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Permitir que todos vejam vistorias (podem ser restringidas depois se necessário)
DROP POLICY IF EXISTS "Users can view own inspections" ON inspections;
CREATE POLICY "All authenticated users can view inspections"
  ON inspections FOR SELECT
  TO authenticated
  USING (true);

-- Policies para checklist_items (apenas admins podem inserir/atualizar)
DROP POLICY IF EXISTS "Users can insert own checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Users can update own checklist items" ON checklist_items;

CREATE POLICY "Only admins can insert checklist items"
  ON checklist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update checklist items"
  ON checklist_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "All authenticated users can view checklist items"
  ON checklist_items FOR SELECT
  TO authenticated
  USING (true);

-- Policy para users: admins podem ver e atualizar todos os perfis
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

