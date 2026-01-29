-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- POLLE TABLE
create table public.polls (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ends_at timestamp with time zone,
  is_active boolean default true
);

-- POLL OPTIONS TABLE
create table public.poll_options (
  id uuid default uuid_generate_v4() primary key,
  poll_id uuid references public.polls(id) on delete cascade not null,
  option_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- VOTES TABLE
create table public.votes (
  id uuid default uuid_generate_v4() primary key,
  poll_id uuid references public.polls(id) on delete cascade not null,
  option_id uuid references public.poll_options(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Constraint to ensure one user can only vote once per poll
  unique(poll_id, user_id)
);

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.votes enable row level security;

-- Polls Policies
create policy "Polls are viewable by everyone" 
  on public.polls for select 
  using (true);

create policy "Users can create polls" 
  on public.polls for insert 
  with check (auth.uid() = created_by);

create policy "Users can update their own polls" 
  on public.polls for update 
  using (auth.uid() = created_by);

-- Poll Options Policies
create policy "Options are viewable by everyone" 
  on public.poll_options for select 
  using (true);

create policy "Users can create options for their polls" 
  on public.poll_options for insert 
  with check (
    exists (
      select 1 from public.polls
      where id = poll_id
      and created_by = auth.uid()
    )
  );

-- Votes Policies
create policy "Votes are viewable by everyone" 
  on public.votes for select 
  using (true);

create policy "Authenticated users can vote" 
  on public.votes for insert 
  with check (auth.uid() = user_id);

-- REALTIME SETUP
-- Enable realtime for all tables
alter publication supabase_realtime add table public.polls;
alter publication supabase_realtime add table public.poll_options;
alter publication supabase_realtime add table public.votes;
