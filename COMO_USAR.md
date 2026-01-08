# 🚀 Como Usar o Sistema - Bar do Português

## ✅ Configuração Concluída!

Seu sistema está configurado e pronto para uso. Aqui está o que foi feito:

### 📊 Banco de Dados
- ✅ Tabelas criadas (franchises, users, inspections, checklist_items)
- ✅ Row Level Security (RLS) habilitado para segurança
- ✅ 6 franquias cadastradas no sistema
- ✅ Trigger automático para criar usuário após registro

### 🔐 Autenticação
- ✅ Sistema de login e registro funcionando
- ✅ Middleware de autenticação configurado
- ✅ Proteção de rotas implementada

---

## 📝 Como Começar

### 1. Criar Sua Conta de Administrador

**Acesse a página de registro:**
- Clique no botão de Preview/Visualizar
- Vá para `/auth/sign-up`
- Preencha o formulário com seus dados
- Use um email válido (você receberá um email de confirmação)

**Confirme seu email:**
- Verifique sua caixa de entrada
- Clique no link de confirmação do Supabase
- Após confirmar, faça login no sistema

### 2. Tornar Seu Usuário Administrador

Após criar sua conta e confirmar o email, você precisa atualizar seu usuário para ter permissão de admin. Execute este comando SQL no Supabase:

```sql
-- Substitua 'seu@email.com' pelo email que você cadastrou
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'seu@email.com';
```

**Como executar no v0:**
1. Eu posso executar este comando para você
2. Ou você pode executar diretamente no Dashboard do Supabase:
   - Vá para seu projeto no Supabase
   - Acesse "SQL Editor"
   - Cole o comando acima
   - Clique em "Run"

### 3. Fazer Login

- Acesse `/auth/login`
- Entre com seu email e senha
- Você será redirecionado para o Dashboard

---

## 🎯 Funcionalidades Disponíveis

### Para Administradores:
- ✅ Ver todas as franquias
- ✅ Criar e gerenciar vistorias
- ✅ Ver histórico completo
- ✅ Gerenciar usuários
- ✅ Ver analytics e relatórios

### Para Supervisores:
- ✅ Ver apenas sua franquia
- ✅ Criar vistorias para sua franquia
- ✅ Ver histórico da franquia
- ✅ Ver analytics da franquia

---

## 📧 Próximos Passos

1. **Crie sua conta** em `/auth/sign-up`
2. **Confirme seu email** (verifique inbox/spam)
3. **Me avise aqui no chat** para eu tornar você administrador
4. **Faça login** e comece a usar o sistema!

---

## 🆘 Precisa de Ajuda?

Se encontrar qualquer problema:
1. Me avise aqui no chat
2. Eu posso executar comandos SQL para você
3. Eu posso corrigir qualquer erro

**Está pronto para começar? Crie sua conta agora!** 🎉
