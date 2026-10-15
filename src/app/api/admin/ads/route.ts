import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { 
  getAllCombinedAds, 
  saveAdToStore, 
  updateAdInStore, 
  deleteAdFromStore 
} from '@/lib/data/ad-store';
import { AdCreative } from '@/types/database';

export const dynamic = 'force-dynamic';

/**
 * GET: Lấy danh sách tất cả các banner / chiến dịch quảng cáo
 */
export async function GET() {
  try {
    const ads = getAllCombinedAds();
    return NextResponse.json({
      success: true,
      total: ads.length,
      ads,
    });
  } catch (error: any) {
    console.error('Lỗi API admin ads GET:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST: Tạo chiến dịch quảng cáo mới (hỗ trợ ảnh tĩnh hoặc ảnh GIF chuyển động)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      image_url, 
      destination_url, 
      placement_id = 'header_top', 
      is_active = true 
    } = body;

    if (!title || !image_url) {
      return NextResponse.json({ 
        success: false, 
        error: 'Tiêu đề và đường dẫn ảnh/GIF quảng cáo không được để trống.' 
      }, { status: 400 });
    }

    const newAd: AdCreative = {
      id: `ad-${Date.now()}`,
      campaign_id: `camp-${Date.now()}`,
      placement_id: placement_id.trim(),
      title: title.trim(),
      image_url: image_url.trim(),
      destination_url: (destination_url || '').trim() || 'https://tinvanta.vercel.app',
      is_active: Boolean(is_active),
      impressions_count: 0,
      clicks_count: 0,
      created_at: new Date().toISOString(),
    };

    saveAdToStore(newAd);

    try {
      revalidatePath('/', 'page');
      revalidatePath('/bai-viet/[slug]', 'page');
      revalidatePath('/chuyen-muc/[slug]', 'page');
      revalidatePath('/admin/quang-cao', 'page');
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Đã tạo và kích hoạt chiến dịch quảng cáo mới thành công!',
      ad: newAd,
    });
  } catch (error: any) {
    console.error('Lỗi API admin ads POST:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PATCH: Chỉnh sửa và cập nhật quảng cáo (đổi ảnh tĩnh hoặc GIF chuyển động, tiêu đề, link đích, vị trí, trạng thái)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      title, 
      image_url, 
      destination_url, 
      placement_id, 
      is_active,
      impressions_count,
      clicks_count
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID quảng cáo để cập nhật.' }, { status: 400 });
    }

    const updates: Partial<AdCreative> = {};
    if (title !== undefined) updates.title = String(title).trim();
    if (image_url !== undefined) updates.image_url = String(image_url).trim();
    if (destination_url !== undefined) updates.destination_url = String(destination_url).trim();
    if (placement_id !== undefined) updates.placement_id = String(placement_id).trim();
    if (is_active !== undefined) updates.is_active = Boolean(is_active);
    if (typeof impressions_count === 'number') updates.impressions_count = impressions_count;
    if (typeof clicks_count === 'number') updates.clicks_count = clicks_count;

    const updated = updateAdInStore(id, updates);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy quảng cáo để cập nhật.' }, { status: 404 });
    }

    try {
      revalidatePath('/', 'page');
      revalidatePath('/bai-viet/[slug]', 'page');
      revalidatePath('/chuyen-muc/[slug]', 'page');
      revalidatePath('/admin/quang-cao', 'page');
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Cập nhật quảng cáo thành công!',
      ad: updated,
    });
  } catch (error: any) {
    console.error('Lỗi API admin ads PATCH:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Xóa banner quảng cáo khỏi hệ thống
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID quảng cáo cần xóa.' }, { status: 400 });
    }

    const ok = deleteAdFromStore(id);

    try {
      revalidatePath('/', 'page');
      revalidatePath('/bai-viet/[slug]', 'page');
      revalidatePath('/chuyen-muc/[slug]', 'page');
      revalidatePath('/admin/quang-cao', 'page');
    } catch {}

    return NextResponse.json({
      success: true,
      message: ok ? 'Đã xóa quảng cáo thành công!' : 'Quảng cáo đã được dỡ bỏ khỏi hệ thống.',
    });
  } catch (error: any) {
    console.error('Lỗi API admin ads DELETE:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
