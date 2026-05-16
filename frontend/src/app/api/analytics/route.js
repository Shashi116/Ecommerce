import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    return NextResponse.json(await proxyToBackend('/api/analytics', {
      method: 'GET',
    }));
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Failed to fetch analytics' }, { status: error.status || 500 });
  }
}
