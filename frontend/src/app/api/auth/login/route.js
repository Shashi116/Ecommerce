import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json(await proxyToBackend('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }));
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Login failed' }, { status: error.status || 500 });
  }
}
