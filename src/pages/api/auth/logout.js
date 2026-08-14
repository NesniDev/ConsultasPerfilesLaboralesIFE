import { json } from '../../../lib/http.js';

export async function POST() {
  return json({ message: 'Logged out' });
}
