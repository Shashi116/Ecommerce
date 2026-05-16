import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json(await proxyToBackend('/api/payment/order', {
      method: 'POST',
      body: JSON.stringify(body),
    }));
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Failed to create payment order' }, { status: error.status || 500 });
  }
}
