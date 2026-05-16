/**
 * Proxy utility to forward requests to Express backend
 */

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/**
 * Forward request to backend API
 */
export async function proxyToBackend(path, options = {}) {
  const url = `${BACKEND_URL}${path}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
 */
export async function proxyFormDataToBackend(path, formData) {
  const url = `${BACKEND_URL}${path}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
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
