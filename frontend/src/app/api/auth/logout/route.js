import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    return NextResponse.json(await proxyToBackend('/api/auth/logout', {
      method: 'POST',
    }));
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Logout failed' }, { status: error.status || 500 });
  }
}
