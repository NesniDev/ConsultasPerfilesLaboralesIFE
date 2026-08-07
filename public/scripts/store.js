/**
 * StudentStore
 * Async data layer backed by StudentApi (Supabase via server endpoints).
 * Exposes the same public methods the UI expects: load, getAll, getById,
 * add, update, delete, getStats. Maps between the UI model and API rows.
 */
(function (global) {
  function splitFullName(fullName) {
    const tokens = (fullName || '').trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return { nombres: '', apellidos: '' };
    if (tokens.length === 1) return { nombres: tokens[0], apellidos: '' };
    if (tokens.length === 2) return { nombres: tokens[0], apellidos: tokens[1] };
    if (tokens.length === 3) return { nombres: tokens[0], apellidos: `${tokens[1]} ${tokens[2]}` };
    const mid = Math.ceil(tokens.length / 2);
    return {
      nombres: tokens.slice(0, mid).join(' '),
      apellidos: tokens.slice(mid).join(' '),
    };
  }

  function toUiModel(row) {
    const parts = splitFullName(row.full_name);
    return {
      id: row.id,
      nombres: parts.nombres,
      apellidos: parts.apellidos,
      fullName: row.full_name,
      documento: String(row.documento),
      expedicion: row.expedicion,
      cargo: row.cargo,
      funciones: row.funciones,
      fechaInicio: row.fecha_inicio,
      fechaFinalizacion: row.fecha_fin,
      mesesDuracion: row.meses,
      consecutivo: row.consecutivo,
      createdAt: row.created_at,
    };
  }

  function toApiPayload(student) {
    return {
      full_name: `${student.nombres || ''} ${student.apellidos || ''}`.trim(),
      documento: Number(student.documento),
      expedicion: student.expedicion,
      cargo: student.cargo,
      funciones: student.funciones,
      fecha_inicio: student.fechaInicio,
      fecha_fin: student.fechaFinalizacion,
      meses: Number(student.mesesDuracion),
      consecutivo: String(student.consecutivo),
    };
  }

  class StudentStore {
    constructor() {
      this.students = [];
      this.loaded = false;
    }

    async load() {
      const rows = await StudentApi.list();
      this.students = rows.map(toUiModel);
      this.loaded = true;
      return this.students;
    }

    getAll() {
      return this.students;
    }

    getById(id) {
      return this.students.find((s) => s.id === id);
    }

    async add(student) {
      const row = await StudentApi.create(toApiPayload(student));
      const model = toUiModel(row);
      this.students.unshift(model);
      return model;
    }

    async update(id, data) {
      const row = await StudentApi.update(id, toApiPayload(data));
      const model = toUiModel(row);
      const idx = this.students.findIndex((s) => s.id === id);
      if (idx !== -1) this.students[idx] = model;
      return model;
    }

    async delete(id) {
      await StudentApi.remove(id);
      this.students = this.students.filter((s) => s.id !== id);
    }

    getStats() {
      const total = this.students.length;
      const now = new Date();
      const active = this.students.filter(
        (s) => new Date(s.fechaInicio) <= now && new Date(s.fechaFinalizacion) >= now
      ).length;
      const completed = this.students.filter(
        (s) => new Date(s.fechaFinalizacion) < now
      ).length;
      const avgMonths =
        total > 0
          ? Math.round(this.students.reduce((sum, s) => sum + (s.mesesDuracion || 0), 0) / total)
          : 0;
      return { total, active, completed, avgMonths };
    }
  }

  global.StudentStore = StudentStore;
})(window);
