-- SCRIPT DE EMERGÊNCIA: CONFIRMAR EMAILS E SETAR SENHA
-- 1. Confirma o email (caso esteja pendente)
-- 2. Reseta a senha para 123456 (senha super simples para teste)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE auth.users 
SET 
    email_confirmed_at = now(), -- Confirma o email
    encrypted_password = crypt('123456', gen_salt('bf')), -- Senha: 1 2 3 4 5 6
    raw_app_meta_data = '{"provider":"email","providers":["email"]}',
    aud = 'authenticated',
    role = 'authenticated'
WHERE email = 'limpeza01@estanciagrill.com';

-- Garantir tabela pública
UPDATE public.users 
SET role = 'limpeza'
WHERE email = 'limpeza01@estanciagrill.com';
