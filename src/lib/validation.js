function isNumeric(value) {
  if (value === '' || value === null || value === undefined) return false;
  return !Number.isNaN(Number(value));
}

function isInteger(value) {
  return isNumeric(value) && Number.isInteger(Number(value));
}

function isDate(value) {
  if (typeof value !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(Date.parse(`${value}T00:00:00`));
}

const REQUIRED_FIELDS = [
  { key: 'full_name', label: 'nombre completo' },
  { key: 'documento', label: 'documento' },
  { key: 'cargo', label: 'cargo' },
  { key: 'fecha_inicio', label: 'fecha de inicio' },
  { key: 'fecha_fin', label: 'fecha de finalización' },
  { key: 'meses', label: 'meses de duración' },
  { key: 'consecutivo', label: 'número consecutivo' },
];

export function validateCreate(body) {
  const missing = REQUIRED_FIELDS.filter(({ key }) => {
    const value = body[key];
    if (value === undefined || value === null || value === '') return true;
    if (key === 'documento') return !isNumeric(value);
    if (key === 'meses') return !isInteger(value);
    if (key === 'fecha_inicio' || key === 'fecha_fin') return !isDate(value);
    return false;
  });
  return missing.map(({ label }) => label);
}

export function validateUpdate(body) {
  const invalid = [];
  const check = (key, predicate, label) => {
    if (body[key] !== undefined && !predicate(body[key])) invalid.push(label);
  };

  check('full_name', (v) => String(v).trim().length > 0, 'nombre completo');
  check('documento', isNumeric, 'documento');
  check('cargo', (v) => String(v).trim().length > 0, 'cargo');
  check('fecha_inicio', isDate, 'fecha de inicio');
  check('fecha_fin', isDate, 'fecha de finalización');
  check('meses', isInteger, 'meses de duración');
  check('consecutivo', (v) => v !== null && v !== '', 'número consecutivo');
  return invalid;
}
