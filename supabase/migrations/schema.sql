-- 1. Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Allow public read-only access to profiles" on public.profiles
  for select using (true);

create policy "Allow owners to update their profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. Create trigger function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url, bio)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''), 
      'farmer_' || substring(new.id::text, 1, 8)
    ),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    ''
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger if exists or create new
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Create layouts table
create table if not exists public.layouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  image_url text not null,
  planner_data text, -- JSON layout data or custom URL
  category text not null check (category in ('farm', 'animals', 'artisan')),
  farm_type text not null default 'standard',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for layouts
alter table public.layouts enable row level security;

-- Policies for layouts
create policy "Allow public read access to layouts" on public.layouts
  for select using (true);

create policy "Allow owners or Edge Functions to insert layouts" on public.layouts
  for insert with check (auth.uid() = user_id);

create policy "Allow owners or Edge Functions to update layouts" on public.layouts
  for update using (auth.uid() = user_id);

create policy "Allow owners or Edge Functions to delete layouts" on public.layouts
  for delete using (auth.uid() = user_id);

-- 4. Create storage buckets
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('layouts', 'layouts', true)
on conflict (id) do nothing;

-- 5. Storage policies for avatars
drop policy if exists "Public Access to Avatars" on storage.objects;
create policy "Public Access to Avatars" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "Auth Users can upload avatars" on storage.objects;
create policy "Auth Users can upload avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

drop policy if exists "Auth Users can update own avatars" on storage.objects;
create policy "Auth Users can update own avatars" on storage.objects
  for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- 6. Storage policies for layouts
drop policy if exists "Public Access to Layouts" on storage.objects;
create policy "Public Access to Layouts" on storage.objects
  for select using (bucket_id = 'layouts');

drop policy if exists "Auth Users can upload layouts" on storage.objects;
create policy "Auth Users can upload layouts" on storage.objects
  for insert with check (bucket_id = 'layouts' and auth.role() = 'authenticated');

drop policy if exists "Auth Users can delete layouts" on storage.objects;
create policy "Auth Users can delete layouts" on storage.objects
  for delete using (bucket_id = 'layouts' and auth.role() = 'authenticated');
