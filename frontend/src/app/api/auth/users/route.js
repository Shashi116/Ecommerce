import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    return NextResponse.json(await proxyToBackend('/api/auth/users', {
      method: 'GET',
    }));
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Failed to get users' }, { status: error.status || 500 });
  }
}
