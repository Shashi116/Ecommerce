/**
 * Proxy utility to forward requests to Express backend
 */

import { cookies } from 'next/headers';

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/**
 * Forward request to backend API
 * Extracts JWT token from cookies and adds it to Authorization header
 */
export async function proxyToBackend(path, options = {}) {
  const url = `${BACKEND_URL}${path}`;
  
  try {
    // Get cookies from the incoming request
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if token exists
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      // Server-to-server calls don't use credentials
    });

    // Handle auth errors - redirect to login if needed
    if (response.status === 401 || response.status === 403) {
      // Let the caller handle auth errors
    }

    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.message || `Backend error: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Backend request failed: ${path}`, error);
    throw error;
  }
}

/**
 * Forward FormData requests (for file uploads)
 * Extracts JWT token from cookies and adds it to Authorization header
 */
export async function proxyFormDataToBackend(path, formData) {
  const url = `${BACKEND_URL}${path}`;
  
  try {
    // Get cookies from the incoming request
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;

    const headers = {};

    // Add Authorization header if token exists
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      // Don't set Content-Type for FormData - browser will set it with boundary
    });

    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.message || `Backend error: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Backend form request failed: ${path}`, error);
    throw error;
  }
}
