import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await proxyToBackend('/api/payment/key', {
      method: 'GET',
    }));
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Failed to get Razorpay key' }, { status: error.status || 500 });
  }
}
