# 🚀 Sistema de Gestão de Ordens de Serviço

Plataforma completa para gestão de clientes e ordens de serviço, com landing page moderna, painel administrativo e design system próprio.

---

## 🌐 Site Público (/)
- Landing page moderna com **hero animado**
- Seções de **serviços**, **processo** e **contato**
- **Botão flutuante do WhatsApp** em todas as páginas  
  📞 [47 98899-2553](tel:47988992553)

---

## 🔐 Login/Cadastro (/login)
- Sistema de autenticação simples
- **Primeiro usuário cadastrado** se torna **admin automaticamente**

---

## 📊 Painel de Gestão (/dashboard)

### Visão Geral
- Estatísticas: clientes, OS abertas, entregues
- Lista de ordens recentes

### Clientes
- CRUD completo
- Busca avançada
- Atalho direto para WhatsApp

### Ordens de Serviço
- Controle de **status**:
  - aberta
  - em andamento
  - aguardando peça
  - pronta
  - entregue
- Definição de **prioridade**
- Registro de **valor**, **equipamento**, **diagnóstico** e **serviço executado**

---

## 🎨 Design System
- Paleta **azul/roxo tech**
- Tipografia: **Space Grotesk** + **Inter**
- Uso de **gradientes** e **glow effects**

---

## 🛡️ Banco de Dados
- Segurança com **Row-Level Security (RLS)**
- Papéis separados: **admin** e **técnico**
- Controle via tabela `user_roles`
- **Triggers automáticos** para consistência

---

## 📂 Estrutura do Projeto

/public        # Landing page
/login         # Autenticação
/dashboard     # Painel de gestão
├── clientes
└── ordens
/design-system # Estilos e componentes
/database      # Configuração e triggers

## ⚙️ Tecnologias
- Frontend: React / Next.js
- Backend: Node.js / Express
- Banco: PostgreSQL com RLS
- Estilização: Tailwind + Design System customizado

---

## 📞 Contato
- WhatsApp: [47 98899-2553](tel:47988992553)

---

## 📜 Licença
Este projeto é de uso interno e não possui licença pública definida.
