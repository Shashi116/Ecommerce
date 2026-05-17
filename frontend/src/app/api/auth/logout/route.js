import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    // Call backend logout
    await proxyToBackend('/api/auth/logout', { method: 'POST' });

    // Clear auth cookie on frontend
    const cookieStore = await cookies();
    cookieStore.delete('authToken');

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Logout failed' }, { status: error.status || 500 });
  }
}
