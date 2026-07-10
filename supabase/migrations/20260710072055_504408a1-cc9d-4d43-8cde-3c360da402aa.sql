
-- Revoke EXECUTE from anon/authenticated on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_blog_admin(uuid) FROM PUBLIC, anon, authenticated;
-- is_blog_admin is used inside RLS policies; RLS evaluation runs as the table owner so revoking client EXECUTE doesn't break policies.

-- Trigger to prevent non-admins from modifying status/reviewed_at on blog_access_requests
CREATE OR REPLACE FUNCTION public.prevent_self_approval_blog_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_blog_admin(auth.uid()) THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
       OR NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Not authorized to modify status, reviewed_at, user_id, or email';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_self_approval_blog_access() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS blog_access_requests_prevent_self_approval ON public.blog_access_requests;
CREATE TRIGGER blog_access_requests_prevent_self_approval
BEFORE UPDATE ON public.blog_access_requests
FOR EACH ROW EXECUTE FUNCTION public.prevent_self_approval_blog_access();
