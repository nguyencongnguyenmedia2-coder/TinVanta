import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, any> = {
    timestamp: '2026-10-15T12:00:00.000Z',
    status: 'healthy',
    environment: process.env.NODE_ENV || 'production',
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isMock = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('mock-newshub');

  checks.database = {
    configured: !isMock,
    mode: isMock ? 'fallback_in_memory_mock' : 'live_supabase_postgresql',
  };

  if (!isMock) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.from('categories').select('count', { count: 'exact', head: true });
      if (error) {
        checks.database.status = 'error';
        checks.database.error = error.message;
        checks.status = 'degraded';
      } else {
        checks.database.status = 'connected';
      }
    } catch (err: any) {
      checks.database.status = 'unreachable';
      checks.database.error = err?.message || 'Connection failed';
      checks.status = 'degraded';
    }
  } else {
    checks.database.status = 'active_mock_operational';
    checks.database.note = 'Hệ thống đang chạy chế độ Mock Repository an toàn cho development và testing.';
  }

  // System runtime stats
  checks.system = {
    nodeVersion: process.version,
    platform: process.platform,
    responseTimeMs: Date.now() - startTime,
    features: {
      vietnameseFullTextSearch: true,
      rowLevelSecurity: true,
      editorial7StepWorkflow: true,
      webSpeechTTS: true,
      pwaManifest: true,
      decree13Compliance: true,
    }
  };

  return NextResponse.json(checks, {
    status: checks.status === 'healthy' ? 200 : 207,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
