# JD MotoConquista

Site oficial da **JD MotoConquista** — compra, venda e aluguel de motocicletas com intenção de compra em João Pessoa e Santa Rita (PB).

Inclui site público (catálogo com busca e filtros, página de cada moto, serviços, aluguel, contato, FAQ) e painel administrativo (motos, fotos, leads, FAQ e configurações).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- Supabase (Postgres, Auth, Storage) com Row Level Security
- React Router 7, Lucide Icons
- Deploy na Vercel (funções `api/sitemap` e `api/robots`)

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha com a URL e a anon key do Supabase
npm run dev
```

Scripts: `npm run dev`, `npm run build` (typecheck + build), `npm run typecheck`, `npm run preview`.

## Variáveis de ambiente

| Variável | Onde obter |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase › Project Settings › API › Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase › Project Settings › API › `anon` `public` |
| `VITE_SITE_URL` | URL pública do site (ex.: `https://jd-motoconquista.vercel.app`) |

> Nunca use a `service_role` key no frontend nem a coloque no repositório. A segurança dos dados é garantida pelo RLS do banco.

## Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra **SQL Editor › New query**, cole o conteúdo de [`supabase/migrations/20261004000000_init.sql`](supabase/migrations/20261004000000_init.sql) e clique em **Run**. Isso cria as tabelas, as políticas de segurança (RLS), o bucket de imagens `media` e os dados reais da empresa.
3. Em **Authentication › Sign In / Providers**, desative **Allow new users to sign up** (só administradores criados por você terão acesso).
4. Crie o usuário administrador em **Authentication › Users › Add user** (marque *Auto Confirm User*).
5. Dê permissão de administrador rodando no SQL Editor:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'SEU-EMAIL@exemplo.com'
on conflict do nothing;
```

6. Acesse `/admin/login` com esse e-mail e senha.

## Segurança (resumo)

- Visitantes podem **ler** motos, fotos, FAQ ativo e configurações, e **enviar** leads (sempre com status `new`).
- Somente usuários presentes na tabela `admins` podem criar/editar/excluir motos, fotos, FAQ, configurações e **ler** leads.
- Upload de imagens no bucket `media` restrito a administradores; leitura pública.
- Rotas `/admin/*` exigem sessão do Supabase Auth **e** permissão de administrador.

## Estrutura

```
api/                    funções Vercel (sitemap.xml e robots.txt dinâmicos)
public/                 favicon, imagem Open Graph
supabase/migrations/    SQL do banco (tabelas, RLS, storage)
src/
  components/           layout, UI, cards, formulários, seções
  context/              autenticação e configurações do site
  lib/                  cliente Supabase, acesso a dados, formatação, WhatsApp
  pages/public/         páginas do site
  pages/admin/          painel administrativo
```

## Conteúdo e imagens

- Nenhum preço, moto, estatística ou condição comercial é inventado: sem dados, o site mostra estados vazios com convite para o WhatsApp.
- A imagem padrão da home vem do [Unsplash](https://unsplash.com/license) (licença livre) e pode ser trocada em **Painel › Configurações**. As fotos das motos são enviadas pelo painel.
