export type UserRole = 
  | 'super_admin' 
  | 'admin' 
  | 'editor_in_chief' 
  | 'editor' 
  | 'reporter' 
  | 'seo_manager' 
  | 'ads_manager' 
  | 'moderator' 
  | 'reader' 
  | 'guest';

export type ArticleStatus = 
  | 'draft' 
  | 'pending_review' 
  | 'changes_requested' 
  | 'approved' 
  | 'scheduled' 
  | 'published' 
  | 'archived';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  slug: string;
  avatar_url?: string | null;
  bio?: string | null;
  title_role: string;
  is_author: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  sort_order: number;
  is_active: boolean;
  show_in_menu: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  article_count: number;
  created_at: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  file_size: number;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  caption?: string | null;
  credit?: string | null;
  uploaded_by?: string | null;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  sapo: string;
  content_html: string;
  content_json?: Record<string, unknown> | null;
  primary_category_id: string;
  featured_image_id?: string | null;
  status: ArticleStatus;
  version: number;
  published_at?: string | null;
  scheduled_at?: string | null;
  reading_time_minutes: number;
  is_featured: boolean;
  is_breaking: boolean;
  allow_comments: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  view_count: number;
  likes_count?: number;
  summary_points?: string[];
  created_by: string;
  approved_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Joined relations
  category?: Category;
  featured_image?: MediaAsset;
  author?: Profile;
  tags?: Tag[];
}

export interface ArticleVersion {
  id: string;
  article_id: string;
  version: number;
  title: string;
  sapo: string;
  content_html: string;
  content_json?: Record<string, unknown> | null;
  saved_by?: string | null;
  created_at: string;
}

export interface EditorialReview {
  id: string;
  article_id: string;
  reviewer_id: string;
  from_status: ArticleStatus;
  to_status: ArticleStatus;
  decision: 'request_changes' | 'approve' | 'reject' | 'publish' | 'schedule';
  notes?: string | null;
  created_at: string;
  reviewer?: Profile;
}

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  moderated_by?: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface AdPlacement {
  id: string;
  name: string;
  location_code: string;
  device_target: 'all' | 'desktop' | 'mobile';
  width?: number | null;
  height?: number | null;
  is_active: boolean;
}

export interface AdCreative {
  id: string;
  campaign_id: string;
  placement_id: string;
  title: string;
  image_url: string;
  destination_url: string;
  impressions_count: number;
  clicks_count: number;
  is_active: boolean;
  created_at: string;
  campaign?: AdCampaign;
}

export interface AdCampaign {
  id: string;
  advertiser_name: string;
  campaign_name: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_by?: string | null;
  created_at: string;
}

export interface SiteSettings {
  key: string;
  value: Record<string, unknown>;
  description?: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  entity: string;
  entity_id?: string | null;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
  user?: Profile;
}
