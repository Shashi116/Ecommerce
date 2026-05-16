import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export const runtime = 'nodejs';

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    return NextResponse.json(await proxyToBackend(`/api/orders/${params.id}/status`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }));
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Failed to update order status' }, { status: error.status || 500 });
  }
}
