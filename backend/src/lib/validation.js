export function validateCreate(body) {
  const required = ['full_name', 'documento', 'cargo', 'fecha_inicio', 'fecha_fin', 'meses', 'consecutivo'];

  for (const field of required) {
    if (!body[field]) {
      return { valid: false, error: `${field} es requerido` };
    }
  }

  return { valid: true };
}

export function validateUpdate(body) {
  // Same as create for now
  return validateCreate(body);
}
