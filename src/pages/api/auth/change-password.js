import { supabase } from '../../../lib/supabase.js';
import { verifyJWT, comparePassword, hashPassword } from '../../../lib/auth.js';
import { json } from '../../../lib/http.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ error: 'Token requerido' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = verifyJWT(token);

    if (!payload || !payload.userId) {
      return json({ error: 'Token inválido' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return json({ error: 'Contraseña actual y nueva requeridas' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('id', payload.userId)
      .single();

    if (userError || !user) {
      console.log('User not found error:', userError);
      return json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const passwordMatch = await comparePassword(currentPassword, user.password_hash);
    if (!passwordMatch) {
      return json({ error: 'Contraseña actual incorrecta' }, { status: 401 });
    }

    const newPasswordHash = await hashPassword(newPassword);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
      .eq('id', payload.userId);

    if (updateError) {
      console.error('Password update error:', updateError);
      return json({ error: 'Error al actualizar la contraseña' }, { status: 500 });
    }

    console.log('Password changed successfully for user:', payload.userId);
    return json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Change password error:', err);
    return json({ error: err.message }, { status: 500 });
  }
}
