-- SCRIPT CORREÇÃO FINAL DE SENHA (USANDO SCHEMA EXTENSIONS)
-- Se deu erro de "função não existe", este script resolve buscando na pasta 'extensions'.

-- 1. Garante a extensão no lugar certo
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- 2. Atualiza a senha forçando o caminho da função
UPDATE auth.users 
SET 
    encrypted_password = extensions.crypt('123456', extensions.gen_salt('bf')),
    email_confirmed_at = now(),
    aud = 'authenticated',
    role = 'authenticated',
    raw_app_meta_data = '{"provider":"email","providers":["email"]}'
WHERE email = 'limpeza01@estanciagrill.com';
