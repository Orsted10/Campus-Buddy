create table if not exists public.career_matches (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    company_name text not null,
    role_title text not null,
    job_description text,
    match_score integer,
    cover_letter text,
    applied boolean default false,
    job_url text
);

alter table public.career_matches enable row level security;

create policy "Users can view their own matches"
    on public.career_matches for select
    using (true); -- For demo purposes, let anyone view matches.
