/**
 * Centralized API Client
 * All fetch calls go through this service
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

class APIClient {
  async request(endpoint, options = {}) {
    const url = `${BACKEND_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Include cookies for auth
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || `API Error: ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // GET request
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // PUT request
  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload file with FormData
  async upload(endpoint, formData) {
    const url = `${BACKEND_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        // Don't set Content-Type for FormData (browser does it automatically)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Upload failed: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Upload Error [${endpoint}]:`, error);
      throw error;
    }
  }
}

export default new APIClient();
