import { supabase } from '../../../lib/supabase.js';
import { generateJWT, comparePassword } from '../../../lib/auth.js';
import { json } from '../../../lib/http.js';

export async function POST({ request }) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ error: 'Email and password required' }, { status: 400 });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, password_hash, role')
      .eq('email', email)
      .single();

    if (error || !users) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = await comparePassword(password, users.password_hash);
    if (!passwordMatch) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateJWT({
      userId: users.id,
      email: users.email,
      role: users.role,
    });

    return json({
      token,
      user: {
        id: users.id,
        email: users.email,
        role: users.role,
      },
    });
  } catch (err) {
    return json({ error: err.message }, { status: 500 });
  }
}
