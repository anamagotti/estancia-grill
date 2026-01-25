
-- SCRIPT DE DIAGNÓSTICO
-- Rode este script para ver o que está acontecendo com os usuários

SELECT 
    au.email, 
    au.role as auth_role, 
    au.confirmed_at,
    pu.role as public_role,
    pu.full_name,
    pu.franchise_id
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email ILIKE 'limpeza%';
