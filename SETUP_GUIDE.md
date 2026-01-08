# Guia de Configuração - Sistema de Vistorias Bar do Português

## Passo 1: Configurar o Banco de Dados

Você precisa executar os scripts SQL na seguinte ordem no seu banco de dados Supabase:

### 1.1 Criar as Tabelas
Execute o script: `scripts/001_create_tables.sql`

Este script cria as tabelas:
- franchises (franquias)
- users (usuários)
- inspections (vistorias)
- checklist_items (itens do checklist)

### 1.2 Habilitar Row Level Security
Execute o script: `scripts/002_enable_rls.sql`

Este script ativa a segurança e define as políticas de acesso.

### 1.3 Criar Trigger de Perfil
Execute o script: `scripts/003_create_profile_trigger.sql`

Este script cria automaticamente um perfil de usuário quando alguém se cadastra.

### 1.4 Adicionar Dados Iniciais
Execute o script: `scripts/004_seed_data.sql`

Este script cria franquias de exemplo.

### 1.5 Adicionar Sistema de Roles
Execute o script: `scripts/005_add_roles.sql`

Este script adiciona a coluna de role (administrador/usuário) e atualiza as políticas RLS.

### 1.6 Criar Primeiro Administrador
Execute o script: `scripts/006_create_first_admin.sql`

Este script cria o usuário administrador inicial.

## Passo 2: Como Executar os Scripts no Supabase

1. Acesse seu projeto no Supabase Dashboard
2. No menu lateral, clique em "SQL Editor"
3. Clique em "New Query"
4. Copie e cole o conteúdo de cada script na ordem indicada
5. Clique em "Run" para executar cada script

## Passo 3: Criar o Usuário Administrador

Após executar todos os scripts SQL, você precisa criar o usuário administrador:

1. Acesse: Authentication > Users no Supabase Dashboard
2. Clique em "Add user" > "Create new user"
3. Use as seguintes credenciais:
   - **Email**: `admin@bardoportugues.com`
   - **Senha**: `Admin@2024!BP`
4. Confirme o email automaticamente (marque a opção)

## Passo 4: Fazer Login no Sistema

Agora você pode fazer login no sistema com:
- Email: `admin@bardoportugues.com`
- Senha: `Admin@2024!BP`

## Passo 5: Adicionar Mais Administradores

Após fazer login como administrador, você pode:
1. Acessar "Gerenciar Usuários" no dashboard
2. Adicionar novos usuários e definir se são administradores ou usuários regulares

## Problemas Comuns

### Erro: "Invalid login credentials"
- Verifique se executou todos os scripts SQL na ordem correta
- Confirme se o usuário foi criado no Supabase Authentication
- Verifique se o email foi confirmado

### Erro: "User not found"
- Execute o script `scripts/003_create_profile_trigger.sql`
- Recrie o usuário no Supabase Authentication

### Erro de permissão ao criar vistoria
- Verifique se executou o script `scripts/005_add_roles.sql`
- Confirme que o usuário tem role='admin' na tabela users

## Estrutura do Banco de Dados

### Tabela: users
- id: UUID (referência do auth.users)
- email: string
- full_name: string
- franchise_id: UUID (referência da franquia)
- role: 'admin' | 'user'
- created_at: timestamp

### Tabela: franchises
- id: UUID
- name: string
- location: string
- created_at: timestamp

### Tabela: inspections
- id: UUID
- franchise_id: UUID
- inspector_id: UUID
- inspection_date: date
- score: number
- classification: string
- observations: text
- created_at: timestamp

### Tabela: checklist_items
- id: UUID
- inspection_id: UUID
- sector: string
- task: string
- status: 'ok' | 'no'
- points: number
- observation: text
- responsible: string
- created_at: timestamp
