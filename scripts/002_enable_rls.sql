-- Habilitar Row Level Security em todas as tabelas
ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- Políticas para franchises (todos podem ver, apenas autenticados podem criar/editar)
CREATE POLICY "franchises_select_all" ON public.franchises
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "franchises_insert_authenticated" ON public.franchises
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "franchises_update_authenticated" ON public.franchises
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Políticas para users (usuários podem ver e editar seus próprios dados)
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para inspections (usuários podem ver da sua franquia e editar suas próprias)
CREATE POLICY "inspections_select_own_franchise" ON public.inspections
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE franchise_id = inspections.franchise_id
    )
  );

CREATE POLICY "inspections_insert_authenticated" ON public.inspections
  FOR INSERT WITH CHECK (
    auth.uid() = inspector_id
  );

CREATE POLICY "inspections_update_own" ON public.inspections
  FOR UPDATE USING (
    auth.uid() = inspector_id
  );

CREATE POLICY "inspections_delete_own" ON public.inspections
  FOR DELETE USING (
    auth.uid() = inspector_id
  );

-- Políticas para checklist_items (vinculadas às inspeções)
CREATE POLICY "checklist_items_select_via_inspection" ON public.checklist_items
  FOR SELECT USING (
    inspection_id IN (
      SELECT id FROM public.inspections WHERE inspector_id = auth.uid()
      OR franchise_id IN (
        SELECT franchise_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "checklist_items_insert_own_inspection" ON public.checklist_items
  FOR INSERT WITH CHECK (
    inspection_id IN (
      SELECT id FROM public.inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "checklist_items_update_own_inspection" ON public.checklist_items
  FOR UPDATE USING (
    inspection_id IN (
      SELECT id FROM public.inspections WHERE inspector_id = auth.uid()
    )
  );

CREATE POLICY "checklist_items_delete_own_inspection" ON public.checklist_items
  FOR DELETE USING (
    inspection_id IN (
      SELECT id FROM public.inspections WHERE inspector_id = auth.uid()
    )
  );
