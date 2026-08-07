import { supabase } from '../../../lib/supabase.js';
import { json } from '../../../lib/http.js';
import { validateUpdate } from '../../../lib/validation.js';
import { mapPartialBodyToRow } from '../../../lib/mapping.js';

export const prerender = false;

export async function GET({ params }) {
  const { data, error } = await supabase
    .from('Estudiantes')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (error) {
    return json({ error: { message: error.message } }, { status: 500 });
  }

  if (!data) {
    return json({ error: { message: 'Estudiante no encontrado' } }, { status: 404 });
  }

  return json({ data });
}

export async function PUT({ params, request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: { message: 'El cuerpo de la solicitud no es un JSON válido' } }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return json({ error: { message: 'El cuerpo de la solicitud debe ser un objeto JSON' } }, { status: 400 });
  }

  const invalid = validateUpdate(body);
  if (invalid.length > 0) {
    return json({ error: { message: `Campos inválidos: ${invalid.join(', ')}` } }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('Estudiantes')
    .update(mapPartialBodyToRow(body))
    .eq('id', params.id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === '23505') {
      return json({ error: { message: 'Ya existe un registro con ese número de documento' } }, { status: 409 });
    }
    return json({ error: { message: error.message } }, { status: 500 });
  }

  if (!data) {
    return json({ error: { message: 'Estudiante no encontrado' } }, { status: 404 });
  }

  return json({ data });
}

export async function DELETE({ params }) {
  const { data, error } = await supabase
    .from('Estudiantes')
    .delete()
    .eq('id', params.id)
    .select('id');

  if (error) {
    return json({ error: { message: error.message } }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return json({ error: { message: 'Estudiante no encontrado' } }, { status: 404 });
  }

  return json({ success: true });
}
