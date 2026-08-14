/**
 * StudentApi
 * Thin HTTP client for the server-side /api/estudiantes endpoints.
 * Every method throws Error(res.error.message) when the request fails.
 */
(function (global) {
  const BASE_URL = '/api/estudiantes';

  async function request(url, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      headers,
      ...options,
    });

    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      throw new Error(payload?.error?.message || `Solicitud fallida (estado ${res.status})`);
    }

    return payload;
  }

  const StudentApi = {
    async list() {
      const payload = await request(BASE_URL);
      return payload.data;
    },

    async get(id) {
      const payload = await request(`${BASE_URL}/${id}`);
      return payload.data;
    },

    async create(payloadBody) {
      const payload = await request(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(payloadBody),
      });
      return payload.data;
    },

    async update(id, payloadBody) {
      const payload = await request(`${BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payloadBody),
      });
      return payload.data;
    },

    async remove(id) {
      await request(`${BASE_URL}/${id}`, { method: 'DELETE' });
    },
  };

  global.StudentApi = StudentApi;
})(window);
