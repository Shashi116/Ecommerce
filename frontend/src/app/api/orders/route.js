import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json(await proxyToBackend('/api/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    }), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Failed to create order' }, { status: error.status || 500 });
  }
}

export async function GET(request) {
  try {
    return NextResponse.json(await proxyToBackend('/api/orders', {
      method: 'GET',
    }));
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Failed to fetch orders' }, { status: error.status || 500 });
  }
}
