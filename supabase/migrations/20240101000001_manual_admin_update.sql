-- Verify email
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'xiongjinan29@gmail.com';

-- Promote to admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'xiongjinan29@gmail.com'
);
