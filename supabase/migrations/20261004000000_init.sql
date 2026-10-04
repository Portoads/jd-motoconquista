-- =====================================================================
-- JD MotoConquista — esquema inicial
-- Execute este arquivo inteiro no Supabase: SQL Editor > New query > Run.
-- É idempotente: pode ser executado mais de uma vez sem duplicar nada.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Administradores
-- Somente usuários listados aqui podem gerenciar o site.
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- motorcycles
-- ---------------------------------------------------------------------
create table if not exists public.motorcycles (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (char_length(brand) between 1 and 80),
  model text not null check (char_length(model) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  year integer check (year between 1950 and 2100),
  price numeric(12, 2) check (price >= 0),
  mileage integer check (mileage >= 0),
  engine text,
  category text,
  transmission text,
  fuel text,
  color text,
  description text,
  status text not null default 'available'
    check (status in ('available', 'reserved', 'sold', 'rented')),
  featured boolean not null default false,
  main_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists motorcycles_status_idx on public.motorcycles (status);
create index if not exists motorcycles_created_at_idx on public.motorcycles (created_at desc);

drop trigger if exists motorcycles_updated_at on public.motorcycles;
create trigger motorcycles_updated_at
  before update on public.motorcycles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- motorcycle_images
-- ---------------------------------------------------------------------
create table if not exists public.motorcycle_images (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references public.motorcycles(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists motorcycle_images_moto_idx
  on public.motorcycle_images (motorcycle_id, sort_order);

-- ---------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (char_length(phone) between 8 and 30),
  email text check (email is null or char_length(email) <= 160),
  subject text check (subject is null or char_length(subject) <= 160),
  message text check (message is null or char_length(message) <= 4000),
  motorcycle_id uuid references public.motorcycles(id) on delete set null,
  source text not null default 'contato'
    check (source in ('contato', 'moto', 'aluguel', 'servicos', 'venda', 'outro')),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'negotiating', 'won', 'lost')),
  created_at timestamptz not null default now()
);

create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- ---------------------------------------------------------------------
-- faq
-- ---------------------------------------------------------------------
create table if not exists public.faq (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 3 and 300),
  answer text not null check (char_length(answer) between 1 and 4000),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists faq_updated_at on public.faq;
create trigger faq_updated_at
  before update on public.faq
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- site_settings (linha única, id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  company_name text not null default 'JD MotoConquista',
  whatsapp text,
  email text,
  instagram text,
  region text,
  logo_url text,
  hero_image_url text,
  description text,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Dados reais informados pela empresa.
insert into public.site_settings (id, company_name, whatsapp, email, instagram, region, description)
values (
  1,
  'JD MotoConquista',
  '5583999216437',
  'jdmotoconquista@gmail.com',
  'jdmotoconquista',
  'João Pessoa e Santa Rita — PB',
  'Compra, venda e aluguel de motocicletas com intenção de compra. Atendimento online em João Pessoa e Santa Rita — PB.'
)
on conflict (id) do nothing;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.admins enable row level security;
alter table public.motorcycles enable row level security;
alter table public.motorcycle_images enable row level security;
alter table public.leads enable row level security;
alter table public.faq enable row level security;
alter table public.site_settings enable row level security;

-- admins: cada usuário vê apenas a própria linha; ninguém altera pelo app.
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- motorcycles: leitura pública, escrita só de administradores.
drop policy if exists "motorcycles_public_read" on public.motorcycles;
create policy "motorcycles_public_read" on public.motorcycles
  for select to anon, authenticated using (true);

drop policy if exists "motorcycles_admin_insert" on public.motorcycles;
create policy "motorcycles_admin_insert" on public.motorcycles
  for insert to authenticated with check (public.is_admin());

drop policy if exists "motorcycles_admin_update" on public.motorcycles;
create policy "motorcycles_admin_update" on public.motorcycles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "motorcycles_admin_delete" on public.motorcycles;
create policy "motorcycles_admin_delete" on public.motorcycles
  for delete to authenticated using (public.is_admin());

-- motorcycle_images: mesma regra.
drop policy if exists "images_public_read" on public.motorcycle_images;
create policy "images_public_read" on public.motorcycle_images
  for select to anon, authenticated using (true);

drop policy if exists "images_admin_insert" on public.motorcycle_images;
create policy "images_admin_insert" on public.motorcycle_images
  for insert to authenticated with check (public.is_admin());

drop policy if exists "images_admin_update" on public.motorcycle_images;
create policy "images_admin_update" on public.motorcycle_images
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "images_admin_delete" on public.motorcycle_images;
create policy "images_admin_delete" on public.motorcycle_images
  for delete to authenticated using (public.is_admin());

-- leads: qualquer visitante pode ENVIAR (sempre com status "new");
-- somente administradores podem ler, alterar ou excluir.
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert" on public.leads
  for insert to anon, authenticated with check (status = 'new');

drop policy if exists "leads_admin_select" on public.leads;
create policy "leads_admin_select" on public.leads
  for select to authenticated using (public.is_admin());

drop policy if exists "leads_admin_update" on public.leads;
create policy "leads_admin_update" on public.leads
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "leads_admin_delete" on public.leads;
create policy "leads_admin_delete" on public.leads
  for delete to authenticated using (public.is_admin());

-- faq: público vê apenas perguntas ativas; administradores veem e editam tudo.
drop policy if exists "faq_public_read" on public.faq;
create policy "faq_public_read" on public.faq
  for select to anon, authenticated using (active or public.is_admin());

drop policy if exists "faq_admin_insert" on public.faq;
create policy "faq_admin_insert" on public.faq
  for insert to authenticated with check (public.is_admin());

drop policy if exists "faq_admin_update" on public.faq;
create policy "faq_admin_update" on public.faq
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "faq_admin_delete" on public.faq;
create policy "faq_admin_delete" on public.faq
  for delete to authenticated using (public.is_admin());

-- site_settings: leitura pública, edição só de administradores.
drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "settings_admin_update" on public.site_settings;
create policy "settings_admin_update" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Permissões de tabela (o RLS acima é quem decide linha a linha).
grant select on public.motorcycles, public.motorcycle_images, public.faq, public.site_settings to anon, authenticated;
grant insert on public.leads to anon, authenticated;
grant select, update, delete on public.leads to authenticated;
grant insert, update, delete on public.motorcycles, public.motorcycle_images, public.faq to authenticated;
grant update on public.site_settings to authenticated;
grant select on public.admins to authenticated;

-- =====================================================================
-- Storage: bucket público "media" (fotos das motos, logo, imagem da home)
-- Leitura pública; upload/edição/exclusão só de administradores.
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- =====================================================================
-- PRIMEIRO ADMINISTRADOR
-- 1) Authentication > Users > Add user (e-mail e senha, marque "Auto Confirm").
-- 2) Rode a linha abaixo trocando o e-mail:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'SEU-EMAIL@exemplo.com'
--   on conflict do nothing;
-- =====================================================================
