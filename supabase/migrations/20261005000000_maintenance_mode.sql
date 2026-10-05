-- Modo manutenção: quando ligado, o site público mostra uma página de manutenção
-- (o painel /admin continua funcionando para religar).
alter table public.site_settings add column if not exists maintenance_mode boolean not null default false;
