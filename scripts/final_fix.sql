-- SCRIPT DE CORREÇÃO TOTAL (EXECUTE ISTO NO SUPABASE SQL EDITOR)

-- 1. Recarregar o Cache do Schema (Essencial para o erro "querying schema")
NOTIFY pgrst, 'reload schema';

-- 2. Garantir permissões completas para o schema público
-- Isso resolve problemas onde o usuário autenticado não consegue ver as tabelas
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. Vincular os usuários de limpeza à franquia de Bauru
-- Isso evita erros na hora de carregar a dashboard que espera uma franquia
UPDATE public.users
SET franchise_id = (SELECT id FROM public.franchises WHERE name ILIKE '%Bauru%' LIMIT 1)
WHERE email LIKE 'limpeza%@estanciagrill.com';

-- 4. Garantir que a role 'limpeza' esteja definida corretamente
UPDATE public.users 
SET role = 'limpeza' 
WHERE email LIKE 'limpeza%@estanciagrill.com';
