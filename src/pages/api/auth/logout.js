import { json } from '../../../lib/http.js';

export const prerender = false;

export async function POST() {
  return json({ message: 'Logged out' });
}
