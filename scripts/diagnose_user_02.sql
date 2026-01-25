-- DIAGNÓSTICO DETALHADO DO USUÁRIO 02
-- Vamos ver exatamente como ele está cadastrado

SELECT 
    id,
    email,
    encrypted_password,     -- Vamos ver se o hash começa com $2a$ ou $2b$
    email_confirmed_at,     -- Tem que ter data aqui
    confirmed_at,           -- Tem que ter data aqui (alias antigo)
    last_sign_in_at,
    raw_app_meta_data,
    aud,                    -- Tem que ser 'authenticated'
    role,                   -- Tem que ser 'authenticated'
    banned_until,           -- Não pode estar banido
    instance_id             -- Geralmente 00000000-0000-0000-0000-000000000000
FROM auth.users 
WHERE email = '02@estanciagrill.com';
