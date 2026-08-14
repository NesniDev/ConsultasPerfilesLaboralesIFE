import { supabase } from '../../../lib/supabase.js';
import { generateJWT, comparePassword } from '../../../lib/auth.js';
import { json } from '../../../lib/http.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { username, password } = await request.json();
    console.log('Login attempt:', { username, passwordLength: password?.length });

    if (!username || !password) {
      return json({ error: 'Username and password required' }, { status: 400 });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, password_hash, role')
      .eq('username', username)
      .single();

    console.log('User query result:', { error, userFound: !!users, username });

    if (error || !users) {
      console.log('User not found error:', error);
      return json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    const passwordMatch = await comparePassword(password, users.password_hash);
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
      return json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    const token = generateJWT({
      userId: users.id,
      username: users.username,
      role: users.role,
    });

    console.log('Login successful for:', username);

    return json({
      token,
      user: {
        id: users.id,
        username: users.username,
        role: users.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return json({ error: err.message }, { status: 500 });
  }
}
