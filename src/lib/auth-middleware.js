import { verifyJWT } from './auth.js';
import { json } from './http.js';

export function requireAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing authorization header', status: 401 };
  }

  const token = authHeader.substring(7);
  const decoded = verifyJWT(token);
  if (!decoded) {
    return { error: 'Invalid token', status: 401 };
  }

  return { user: decoded };
}

export function requireAdmin(request) {
  const auth = requireAuth(request);
  if (auth.error) return auth;

  if (auth.user.role !== 'admin') {
    return { error: 'Admin access required', status: 403 };
  }

  return auth;
}

export function handleAuthError(error) {
  return json({ error: error.error }, { status: error.status });
}
