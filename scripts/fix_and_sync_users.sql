-- Script de Reparo Geral e Diagnóstico

-- 1. Forçar a sincronização de usuários da auth.users para public.users que estejam faltando
INSERT INTO public.users (id, email, full_name, role)
SELECT 
    au.id, 
    au.email, 
    COALESCE(au.raw_user_meta_data->>'full_name', au.email),
    'limpeza' -- Assumimos limpeza para quem está faltando neste contexto, ou padrao
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 2. Garantir que as roles de limpeza estejam certas
UPDATE public.users 
SET role = 'limpeza' 
WHERE email LIKE 'limpeza%@estanciagrill.com';

-- 3. Atualizar cache do Schema (Importante para o erro "querying schema")
NOTIFY pgrst, 'reload schema';

-- 4. Verificar permissões básicas (grant)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
