export function mapBodyToRow(body) {
  return {
    full_name: body.full_name,
    documento: Number(body.documento),
    expedicion: body.expedicion ?? null,
    cargo: body.cargo,
    funciones: body.funciones ?? null,
    fecha_inicio: body.fecha_inicio,
    fecha_fin: body.fecha_fin,
    meses: Number(body.meses),
    consecutivo: String(body.consecutivo),
  };
}

export function mapPartialBodyToRow(body) {
  const row = {};
  if (body.full_name !== undefined) row.full_name = body.full_name;
  if (body.documento !== undefined) row.documento = Number(body.documento);
  if (body.expedicion !== undefined) row.expedicion = body.expedicion ?? null;
  if (body.cargo !== undefined) row.cargo = body.cargo;
  if (body.funciones !== undefined) row.funciones = body.funciones ?? null;
  if (body.fecha_inicio !== undefined) row.fecha_inicio = body.fecha_inicio;
  if (body.fecha_fin !== undefined) row.fecha_fin = body.fecha_fin;
  if (body.meses !== undefined) row.meses = Number(body.meses);
  if (body.consecutivo !== undefined) row.consecutivo = String(body.consecutivo);
  return row;
}
