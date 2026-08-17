// Convert Supabase row to UI model
export function toUiModel(row) {
  if (!row) return null;

  const [apellidos, nombres] = (row.full_name || '').split(', ');

  return {
    id: row.id,
    nombres: nombres || '',
    apellidos: apellidos || '',
    documento: row.documento,
    expedicion: row.expedicion || '',
    cargo: row.cargo,
    funciones: row.funciones || '',
    fechaInicio: row.fecha_inicio,
    fechaFinalizacion: row.fecha_fin,
    mesesDuracion: row.meses,
    consecutivo: row.consecutivo,
    tipoDocumento: row.tipo_documento || 'CC',
    createdAt: row.created_at
  };
}

// Convert UI model to API payload (Supabase row)
export function toApiPayload(uiModel) {
  const fullName = uiModel.apellidos
    ? `${uiModel.apellidos}, ${uiModel.nombres}`
    : uiModel.nombres;

  return {
    full_name: fullName,
    documento: uiModel.documento,
    expedicion: uiModel.expedicion || null,
    cargo: uiModel.cargo,
    funciones: uiModel.funciones || null,
    fecha_inicio: uiModel.fechaInicio,
    fecha_fin: uiModel.fechaFinalizacion,
    meses: uiModel.mesesDuracion,
    consecutivo: uiModel.consecutivo,
    tipo_documento: uiModel.tipoDocumento || 'CC'
  };
}
