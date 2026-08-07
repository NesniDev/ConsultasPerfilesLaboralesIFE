import { supabase } from '../../lib/supabase.js';
import { json } from '../../lib/http.js';
import { validateCreate } from '../../lib/validation.js';
import { mapBodyToRow } from '../../lib/mapping.js';

export const prerender = false;

export async function GET() {
  const { data, error } = await supabase
    .from('Estudiantes')
    .select('*')
    .order('consecutivo', { ascending: true });

  if (error) {
    return json({ error: { message: error.message } }, { status: 500 });
  }

  return json({ data });
}

export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: { message: 'El cuerpo de la solicitud no es un JSON válido' } }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return json({ error: { message: 'El cuerpo de la solicitud debe ser un objeto JSON' } }, { status: 400 });
  }

  const invalid = validateCreate(body);
  if (invalid.length > 0) {
    return json({ error: { message: `Campos obligatorios faltantes o inválidos: ${invalid.join(', ')}` } }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('Estudiantes')
    .insert(mapBodyToRow(body))
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return json({ error: { message: 'Ya existe un registro con ese número de documento' } }, { status: 409 });
    }
    return json({ error: { message: error.message } }, { status: 500 });
  }

  return json({ data }, { status: 201 });
}
