import { createServerSupabaseClient } from '@/lib/supabase/server';
import { UserRole } from '@/types/database';

export const ROLE_PERMISSIONS_MAP: Record<UserRole, string[]> = {
  super_admin: ['*'], // Full access
  admin: [
    'articles.read_published', 'articles.read_all', 'articles.create', 'articles.update_own',
    'articles.update_assigned', 'articles.review', 'articles.approve', 'articles.publish',
    'articles.schedule', 'articles.archive', 'categories.manage', 'tags.manage',
    'media.upload', 'media.delete', 'seo.manage', 'ads.manage', 'comments.moderate',
    'users.manage', 'settings.manage', 'analytics.read', 'audit_logs.read'
  ],
  editor_in_chief: [
    'articles.read_published', 'articles.read_all', 'articles.create', 'articles.update_own',
    'articles.update_assigned', 'articles.review', 'articles.approve', 'articles.publish',
    'articles.schedule', 'articles.archive', 'categories.manage', 'tags.manage',
    'media.upload', 'media.delete', 'seo.manage', 'comments.moderate', 'analytics.read'
  ],
  editor: [
    'articles.read_published', 'articles.read_all', 'articles.create', 'articles.update_own',
    'articles.update_assigned', 'articles.review', 'tags.manage', 'media.upload',
    'comments.moderate', 'analytics.read'
  ],
  reporter: [
    'articles.read_published', 'articles.create', 'articles.update_own', 'tags.manage', 'media.upload'
  ],
  seo_manager: [
    'articles.read_published', 'articles.read_all', 'categories.manage', 'tags.manage', 'seo.manage', 'analytics.read'
  ],
  ads_manager: [
    'articles.read_published', 'ads.manage', 'media.upload', 'analytics.read'
  ],
  moderator: [
    'articles.read_published', 'comments.moderate'
  ],
  reader: [
    'articles.read_published'
  ],
  guest: [
    'articles.read_published'
  ]
};

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  // Lấy profile và roles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', user.id);

  const roles = (userRoles?.map(r => r.role_id) || ['guest']) as UserRole[];

  return {
    ...user,
    profile,
    roles,
  };
}

export async function hasPermission(requiredPermission: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    return requiredPermission === 'articles.read_published';
  }

  // Super Admin có quyền tuyệt đối
  if (user.roles.includes('super_admin')) return true;

  // Kiểm tra qua ROLE_PERMISSIONS_MAP
  for (const role of user.roles) {
    const permissions = ROLE_PERMISSIONS_MAP[role] || [];
    if (permissions.includes('*') || permissions.includes(requiredPermission)) {
      return true;
    }
  }

  return false;
}
