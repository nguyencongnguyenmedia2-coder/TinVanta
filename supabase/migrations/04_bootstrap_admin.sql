-- ====================================================================
-- NEWSHUB VIỆT NAM — MIGRATION 04: BOOTSTRAP SUPER ADMIN
-- ====================================================================

-- Hàm an toàn để bootstrap Super Admin ban đầu
-- Cách dùng trong Supabase SQL Editor:
-- SELECT public.bootstrap_super_admin('USER_UUID_FROM_AUTH_USERS', 'admin@newshub.vn', 'Tổng Quản Trị Viên');

CREATE OR REPLACE FUNCTION public.bootstrap_super_admin(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT DEFAULT 'Tổng Quản Trị Viên'
)
RETURNS JSONB AS $$
DECLARE
  v_slug TEXT;
  v_res JSONB;
BEGIN
  -- Tạo slug tác giả chuẩn hóa
  v_slug := 'admin-' || substr(p_user_id::text, 1, 8);

  -- 1. Tạo hoặc cập nhật profile
  INSERT INTO public.profiles (id, email, full_name, slug, title_role, is_author, is_active)
  VALUES (p_user_id, p_email, p_full_name, v_slug, 'Super Admin', true, true)
  ON CONFLICT (id) DO UPDATE 
  SET full_name = EXCLUDED.full_name,
      title_role = 'Super Admin',
      is_active = true;

  -- 2. Gán quyền super_admin
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (p_user_id, 'super_admin')
  ON CONFLICT (user_id, role_id) DO NOTHING;

  -- 3. Ghi audit log
  INSERT INTO public.audit_logs (user_id, action, entity, entity_id, details)
  VALUES (p_user_id, 'BOOTSTRAP_SUPER_ADMIN', 'user_roles', p_user_id::text, jsonb_build_object('role', 'super_admin', 'email', p_email));

  v_res := jsonb_build_object(
    'status', 'success',
    'message', 'Super Admin bootstrap completed successfully',
    'user_id', p_user_id,
    'email', p_email
  );

  RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
