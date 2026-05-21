# 🏙️ Urban Reports API — Modo JSON

Back-end **sem banco de dados**. Todos os dados ficam em `./database/json/`.
Ideal para testar a aplicação rapidamente sem instalar MySQL.

## 🚀 Como rodar

```bash
npm install
cp .env.example .env
npm run dev
```

Acesse: **http://localhost:3000**

## 📁 Onde ficam os dados

```
/database/json/
  ├── users.json     ← usuários cadastrados
  └── reports.json   ← denúncias criadas
```

Você pode abrir e editar esses arquivos diretamente para inspecionar ou limpar os dados.

## 🔄 Migrar para MySQL depois

Quando quiser usar MySQL de verdade, use o projeto `urban-reports-api-mysql`.
Os controllers e rotas são idênticos — só muda a camada de persistência.

## 📡 Endpoints

Idênticos à versão MySQL:

| Método | Rota | Auth |
|--------|------|------|
| POST | `/users/register` | — |
| POST | `/users/login` | — |
| GET  | `/users/profile` | ✅ |
| POST | `/reports` | ✅ |
| GET  | `/reports` | — |
| GET  | `/reports/nearby?lat=&lng=&raio=` | — |
| PATCH | `/reports/:id/status` | ✅ Admin |
| DELETE | `/reports/:id` | ✅ |

## 📸 Imagens

Upload salvo localmente em `/uploads/`. Sem Cloudinary necessário.
