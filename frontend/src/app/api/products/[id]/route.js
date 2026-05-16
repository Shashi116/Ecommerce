import { NextResponse } from 'next/server';
import { proxyToBackend, proxyFormDataToBackend } from '@/lib/api-proxy';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  try {
    return NextResponse.json(await proxyToBackend(`/api/products/${params.id}`, {
      method: 'GET',
    }));
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Failed to fetch product' }, { status: error.status || 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const formData = await request.formData();
    const data = await proxyFormDataToBackend(`/api/products/${params.id}`, formData);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Failed to update product' }, { status: error.status || 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    return NextResponse.json(await proxyToBackend(`/api/products/${params.id}`, {
      method: 'DELETE',
    }));
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Failed to delete product' }, { status: error.status || 500 });
  }
}
