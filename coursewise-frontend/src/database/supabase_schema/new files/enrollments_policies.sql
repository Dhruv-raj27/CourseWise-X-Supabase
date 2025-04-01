-- Enable RLS on enrollments table
alter table enrollments enable row level security;

-- Create a function to check if a user is an admin
create or replace function is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from user_profiles
    where id = user_id
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Admin Policies
-- Admins can view all enrollments
create policy "admins can view all enrollments"
on enrollments for select
to authenticated
using (is_admin(auth.uid()));

-- Admins can insert enrollments for any user
create policy "admins can insert enrollments"
on enrollments for insert
to authenticated
with check (is_admin(auth.uid()));

-- Admins can update any enrollment
create policy "admins can update enrollments"
on enrollments for update
to authenticated
using (is_admin(auth.uid()))
with check (is_admin(auth.uid()));

-- Admins can delete any enrollment
create policy "admins can delete enrollments"
on enrollments for delete
to authenticated
using (is_admin(auth.uid()));

-- Student Policies
-- Students can view their own enrollments
create policy "students can view own enrollments"
on enrollments for select
to authenticated
using (auth.uid() = user_id);

-- Students can enroll themselves in courses
create policy "students can enroll themselves"
on enrollments for insert
to authenticated
with check (
  auth.uid() = user_id
  and status = 'active'
  and not exists (
    select 1
    from enrollments e
    where e.user_id = auth.uid()
    and e.course_id = enrollments.course_id
    and e.status = 'active'
  )
);

-- Students can update their own enrollment status
create policy "students can update own enrollment status"
on enrollments for update
to authenticated
using (auth.uid() = user_id and status = 'active')
with check (
  auth.uid() = user_id
  and status in ('dropped', 'completed')
);

-- Students cannot delete enrollments (only update status)
-- No delete policy for students

-- Add completed_at trigger
create or replace function set_completed_at()
returns trigger as $$
begin
  -- Only set completed_at when status changes to completed
  if (TG_OP = 'UPDATE') then
    if (NEW.status = 'completed' and OLD.status != 'completed') then
      NEW.completed_at = now();
    elsif (NEW.status != 'completed') then
      NEW.completed_at = null;
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger set_enrollment_completed_at
before update on enrollments
for each row
execute function set_completed_at();

-- Add updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  if (TG_OP = 'UPDATE') then
    NEW.updated_at = now();
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger set_enrollment_updated_at
before update on enrollments
for each row
execute function set_updated_at(); 