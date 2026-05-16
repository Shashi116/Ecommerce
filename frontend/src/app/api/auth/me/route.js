import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    return NextResponse.json(await proxyToBackend('/api/auth/me', {
      method: 'GET',
    }));
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Failed to get user' }, { status: error.status || 500 });
  }
}
