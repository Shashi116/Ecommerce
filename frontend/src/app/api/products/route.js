import { NextResponse } from 'next/server';
import { proxyToBackend, proxyFormDataToBackend } from '@/lib/api-proxy';

export const runtime = 'nodejs';

export async function GET() {
  try {
    return NextResponse.json(await proxyToBackend('/api/products', {
      method: 'GET',
    }));
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Failed to fetch products' }, { status: error.status || 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const data = await proxyFormDataToBackend('/api/products', formData);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Failed to create product' }, { status: error.status || 500 });
  }
}
