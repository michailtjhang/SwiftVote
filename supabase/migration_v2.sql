-- Add visibility and auth_type to polls
alter table public.polls
add column visibility text check (visibility in ('public', 'shared')) default 'public',
add column auth_type text check (auth_type in ('account', 'ip')) default 'account';

-- Update votes table to support IP-based voting
alter table public.votes
alter column user_id
drop not null,
add column ip_address text;

-- Drop existing unique constraint
alter table public.votes
drop constraint votes_poll_id_user_id_key;

-- Add new unique constraints for both auth types
create unique index votes_poll_account_unique on public.votes (poll_id, user_id)
where
    user_id is not null;

create unique index votes_poll_ip_unique on public.votes (poll_id, ip_address)
where
    ip_address is not null;

-- Update Policies for Polls (Shared polls hidden from general select, but accessible via ID)
drop policy "Polls are viewable by everyone" on public.polls;

create policy "Polls are viewable by everyone" on public.polls for
select
    using (true);

-- Note: We filter visibility in the application layer or specific queries, 
-- but RLS allows reading all so direct links work.
-- Update Policies for Votes
drop policy "Authenticated users can vote" on public.votes;

create policy "Users can vote (Account)" on public.votes for insert
with
    check (auth.uid () = user_id);

-- For IP voting, we rely on Server Actions bypassing RLS or Service Role, 
-- but if we want RLS for public insert with IP:
create policy "Anonymous IP vote" on public.votes for insert
with
    check (
        auth.uid () is null
        and ip_address is not null
    );