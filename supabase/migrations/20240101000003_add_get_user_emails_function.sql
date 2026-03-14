-- Drop existing function if it exists (needed to change return type)
DROP FUNCTION IF EXISTS public.get_user_emails(uuid[]);

-- Function to get user emails for admin
-- This function allows admins to get user emails while maintaining security
CREATE FUNCTION public.get_user_emails(user_ids uuid[])
RETURNS TABLE(user_id uuid, user_email text) 
LANGUAGE plpgsql 
SECURITY DEFINER AS $$
BEGIN
  -- Check if the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can access user emails';
  END IF;

  RETURN QUERY
  SELECT au.id::uuid AS user_id, au.email::text AS user_email
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_emails TO authenticated;

-- Add RLS policy for the function
COMMENT ON FUNCTION public.get_user_emails IS 'Allows admins to retrieve user emails securely';
