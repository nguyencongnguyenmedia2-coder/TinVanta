import { NextResponse } from 'next/server';
import { MOCK_AD_CREATIVES } from '@/lib/data/mock-data';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const creativeId = searchParams.get('id');

    if (!creativeId) {
      return NextResponse.json({ error: 'Creative ID thiếu' }, { status: 400 });
    }

    // Tra cứu destination URL từ DB/Mock
    const creative = MOCK_AD_CREATIVES.find(c => c.id === creativeId);
    if (!creative) {
      return NextResponse.json({ error: 'Không tìm thấy quảng cáo' }, { status: 404 });
    }

    // Tăng click count (idempotent / rate limited)
    creative.clicks_count += 1;

    return NextResponse.json({
      status: 'success',
      destination_url: creative.destination_url,
    });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
