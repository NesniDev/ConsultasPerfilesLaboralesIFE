/**
 * Consultas Perfiles Laborales IFE
 * Student Profile Management Application
 * UI controller only. Data lives in Supabase and is accessed through the
 * async StudentStore (see store.js).
 */

// ============================================
// SEARCH / FILTER / SORT / PAGINATE
// ============================================

class StudentQuery {
  constructor(students) {
    this.all = students;
  }

  search(query) {
    if (!query) return this.all;
    const q = query.toLowerCase().trim();
    return this.all.filter(
      (s) =>
        s.documento.toLowerCase().includes(q) ||
        `${s.nombres} ${s.apellidos}`.toLowerCase().includes(q) ||
        s.cargo.toLowerCase().includes(q)
    );
  }

  filter(filters) {
    let result = this.all;

    if (filters.documento) {
      result = result.filter((s) => s.documento.includes(filters.documento));
    }

    return result;
  }

  sort(students, field, direction) {
    if (!field) return students;
    const dir = direction === 'asc' ? 1 : -1;
    return [...students].sort((a, b) => {
      let va = a[field];
      let vb = b[field];
      if (field === 'nombres') {
        va = `${a.nombres} ${a.apellidos}`;
        vb = `${b.nombres} ${b.apellidos}`;
      }
      if (typeof va === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb), 'es') * dir;
    });
  }

  paginate(students, page, perPage) {
    const total = students.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * perPage;
    return {
      data: students.slice(start, start + perPage),
      page: currentPage,
      totalPages,
      total,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  }
}

// ============================================
// UI CONTROLLER
// ============================================

const SVG = {
  eye: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  pencil: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>`,
  chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>`,
  chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  exclamationTriangle: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>`,
  informationCircle: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>`,
};

const CONSECUTIVO_PREFIX = 'CF1222-';

class App {
  constructor() {
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    this.isAdmin = this.user?.role === 'admin';
    this.store = new StudentStore();
    this.query = null;
    this.state = {
      searchQuery: '',
      filters: {},
      sortField: 'consecutivo',
      sortDir: 'asc',
      page: 1,
      perPage: 10,
    };
    this.editingId = null;
  }

  async init() {
    this.checkAuth();
    this.initAuth();
    this.bindEvents();
    await this.loadData();
  }

  checkAuth() {
    // No forced redirect - allows public access
  }

  initAuth() {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      if (this.isAdmin) {
        loginBtn.style.display = 'none';
        this.renderAdminBadge();
      } else {
        loginBtn.style.display = 'inline-flex';
      }
    }
    const adminStats = document.getElementById('admin-stats');
    if (adminStats) {
      adminStats.style.display = this.isAdmin ? 'block' : 'none';
    }
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
      pageHeader.style.display = this.isAdmin ? 'none' : 'block';
    }
    const adminControls = document.getElementById('admin-controls');
    if (adminControls) {
      adminControls.style.display = this.isAdmin ? 'flex' : 'none';
    }
  }

  renderAdminBadge() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      const badge = document.createElement('div');
      badge.style.cssText = 'display: flex; gap: 12px; align-items: center;';
      badge.innerHTML = `
        <span style="font-size: 12px; padding: 4px 8px; background: #3b82f6; color: white; border-radius: 4px;">
          Administrador
        </span>
        <button onclick="app.logout()" style="background: none; border: none; color: #666; cursor: pointer; font-size: 14px; padding: 0;">Cerrar sesión</button>
      `;
      navbar.appendChild(badge);
    }
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  async loadData() {
    const tbody = document.getElementById('student-tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10">
            <div class="empty-state">
              <h3>Cargando registros...</h3>
            </div>
          </td>
        </tr>`;
    }

    try {
      await this.store.load();
      this.render();
    } catch (err) {
      console.error('Failed to load students', err);
      this.showToast(err.message || 'No se pudieron cargar los registros', 'error');
      this.render();
    }
  }

  getFilteredStudents() {
    let students = this.store.getAll();
    this.query = new StudentQuery(students);

    if (this.state.searchQuery) {
      students = this.query.search(this.state.searchQuery);
    }

    if (Object.keys(this.state.filters).length > 0) {
      const q = new StudentQuery(students);
      students = q.filter(this.state.filters);
    }

    return students;
  }

  render() {
    this.renderStats();
    this.renderTable();
  }

  renderStats() {
    const stats = this.store.getStats();
    const el = (id) => document.getElementById(id);
    if (el('stat-total')) el('stat-total').textContent = stats.total;
    if (el('stat-active')) el('stat-active').textContent = stats.active;
    if (el('stat-completed')) el('stat-completed').textContent = stats.completed;
    if (el('stat-avg')) el('stat-avg').textContent = stats.avgMonths;
  }

  renderTable() {
    const students = this.getFilteredStudents();
    const sorted = this.query.sort(students, this.state.sortField, this.state.sortDir);
    const paginated = this.query.paginate(sorted, this.state.page, this.state.perPage);

    const tbody = document.getElementById('student-tbody');
    if (!tbody) return;

    if (paginated.data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10">
            <div class="empty-state">
              ${SVG.users}
              <h3>No se encontraron registros</h3>
              <p>${this.state.searchQuery || Object.keys(this.state.filters).length > 0
                ? 'Intenta ajustar la búsqueda o el filtro de documento'
                : 'Comienza registrando tu primer estudiante'
              }</p>
            </div>
          </td>
        </tr>`;
      this.renderPagination(paginated);
      this.updateSortHeaders();
      return;
    }

    tbody.innerHTML = paginated.data.map((s) => {
      const now = new Date();
      const start = new Date(s.fechaInicio);
      const end = new Date(s.fechaFinalizacion);
      let statusBadge = '';
      let durationCell = `${s.mesesDuracion} meses`;
      if (start > now) {
        statusBadge = '<span class="cell-badge badge-blue"><span class="badge-dot"></span>Programado</span>';
      } else if (end < now) {
        statusBadge = '<span class="cell-badge badge-amber"><span class="badge-dot"></span>Finalizado</span>';
      } else {
        statusBadge = '<span class="cell-badge badge-green"><span class="badge-dot"></span>Activo</span>';
        durationCell = this.formatRemaining(end);
      }

      return `
        <tr data-id="${s.id}">
          <td class="cell-name">${this.escapeHtml(s.nombres)} ${this.escapeHtml(s.apellidos)}</td>
          <td class="cell-document">${this.escapeHtml(s.documento)}</td>
          <td>${this.escapeHtml(s.expedicion)}</td>
          <td>${this.escapeHtml(s.cargo)}</td>
          <td>${this.formatDate(s.fechaInicio)}</td>
          <td>${this.formatDate(s.fechaFinalizacion)}</td>
          <td>${durationCell}</td>
          <td>${this.escapeHtml(s.consecutivo)}</td>
          <td>${statusBadge}</td>
          <td>
            <div class="cell-actions">
              <button class="action-btn view" title="Ver detalles" onclick="app.viewStudent('${s.id}')">
                ${SVG.eye}
              </button>
              ${this.isAdmin ? `
              <button class="action-btn edit" title="Editar" onclick="app.editStudent('${s.id}')">
                ${SVG.pencil}
              </button>
              <button class="action-btn delete" title="Eliminar" onclick="app.confirmDelete('${s.id}')">
                ${SVG.trash}
              </button>
              ` : ''}
            </div>
          </td>
        </tr>`;
    }).join('');

    this.renderPagination(paginated);
    this.updateSortHeaders();
  }

  renderPagination(paginated) {
    const footer = document.getElementById('table-footer');
    if (!footer) return;

    const { page, totalPages, total, hasNext, hasPrev } = paginated;
    const start = (page - 1) * this.state.perPage + 1;
    const end = Math.min(page * this.state.perPage, total);

    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    footer.innerHTML = `
      <span class="table-info">Mostrando ${total > 0 ? start : 0} a ${end} de ${total} registros</span>
      <div class="pagination">
        <button class="page-btn" ${!hasPrev ? 'disabled' : ''} onclick="app.goToPage(${page - 1})">
          ${SVG.chevronLeft}
        </button>
        ${pages.map((p) =>
          p === '...'
            ? `<span class="page-btn" style="cursor:default">...</span>`
            : `<button class="page-btn ${p === page ? 'active' : ''}" onclick="app.goToPage(${p})">${p}</button>`
        ).join('')}
        <button class="page-btn" ${!hasNext ? 'disabled' : ''} onclick="app.goToPage(${page + 1})">
          ${SVG.chevronRight}
        </button>
      </div>`;
  }

  updateSortHeaders() {
    document.querySelectorAll('.data-table th[data-sort]').forEach((th) => {
      const field = th.dataset.sort;
      th.classList.toggle('sorted', field === this.state.sortField);
      const icon = th.querySelector('.sort-icon');
      if (icon) {
        if (field === this.state.sortField) {
          icon.style.transform = this.state.sortDir === 'desc' ? 'rotate(180deg)' : '';
        } else {
          icon.style.transform = '';
        }
      }
    });
  }

  // ---- Actions ----

  goToLogin() {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      document.getElementById('login-email').focus();
    }
  }

  closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      document.getElementById('login-form').reset();
      document.getElementById('login-error').classList.remove('show');
    }
  }

  async handleLogin(event) {
    if (event) event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    const submitBtn = event?.target?.querySelector('[type="submit"]') || document.querySelector('#login-modal .btn-primary');

    if (!email || !password) {
      errorDiv.textContent = 'Por favor completa todos los campos';
      errorDiv.classList.add('show');
      return;
    }

    errorDiv.classList.remove('show');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      this.user = data.user;
      this.isAdmin = true;
      this.closeLoginModal();
      this.initAuth();
      this.showToast('Sesión iniciada correctamente', 'success');
      location.reload();
    } catch (err) {
      errorDiv.textContent = err.message;
      errorDiv.classList.add('show');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  handleFilter(name, value) {
    if (!value) {
      delete this.state.filters[name];
    } else {
      this.state.filters[name] = value;
    }
    this.state.page = 1;
    this.renderTable();
  }

  clearFilters() {
    this.state.filters = {};
    this.state.searchQuery = '';
    const searchInput = document.getElementById('global-search');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.filter-input').forEach((el) => (el.value = ''));
    this.state.page = 1;
    this.renderTable();
  }

  handleSort(field) {
    if (this.state.sortField === field) {
      this.state.sortDir = this.state.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.state.sortField = field;
      this.state.sortDir = 'asc';
    }
    this.renderTable();
  }

  goToPage(page) {
    this.state.page = page;
    this.renderTable();
  }

  // ---- CRUD ----

  openCreateForm() {
    this.editingId = null;
    const form = document.getElementById('student-form');
    if (form) form.reset();
    document.getElementById('modal-title').textContent = 'Registrar Nuevo Estudiante';
    this.openModal('form-modal');
  }

  editStudent(id) {
    const student = this.store.getById(id);
    if (!student) return;

    this.editingId = id;
    document.getElementById('modal-title').textContent = 'Editar Estudiante';

    const fields = ['nombres', 'apellidos', 'documento', 'expedicion', 'cargo', 'funciones', 'fechaInicio', 'fechaFinalizacion', 'mesesDuracion', 'consecutivo'];
    fields.forEach((f) => {
      const el = document.getElementById(`field-${f}`);
      if (el) el.value = student[f] || '';
    });

    this.openModal('form-modal');
  }

  async saveStudent() {
    const data = {
      nombres: document.getElementById('field-nombres')?.value?.trim(),
      apellidos: document.getElementById('field-apellidos')?.value?.trim(),
      documento: document.getElementById('field-documento')?.value?.trim(),
      expedicion: document.getElementById('field-expedicion')?.value?.trim(),
      cargo: document.getElementById('field-cargo')?.value?.trim(),
      funciones: document.getElementById('field-funciones')?.value?.trim(),
      fechaInicio: document.getElementById('field-fechaInicio')?.value,
      fechaFinalizacion: document.getElementById('field-fechaFinalizacion')?.value,
      mesesDuracion: Number(document.getElementById('field-mesesDuracion')?.value) || 0,
      consecutivo: this.editingId
        ? document.getElementById('field-consecutivo')?.value?.trim()
        : `${CONSECUTIVO_PREFIX}${document.getElementById('field-consecutivo')?.value?.trim() || ''}`,
    };

    // Validation
    if (!data.nombres || !data.apellidos || !data.documento || !data.cargo) {
      this.showToast('Por favor completa los campos obligatorios', 'error');
      return;
    }

    try {
      if (this.editingId) {
        await this.store.update(this.editingId, data);
        this.showToast('Estudiante actualizado correctamente', 'success');
      } else {
        await this.store.add(data);
        this.showToast('Estudiante registrado correctamente', 'success');
      }
    } catch (err) {
      console.error('Failed to save student', err);
      this.showToast(err.message || 'No se pudo guardar el estudiante', 'error');
      return;
    }

    this.closeModal('form-modal');
    this.render();
  }

  viewStudent(id) {
    const s = this.store.getById(id);
    if (!s) return;

    const now = new Date();
    const start = new Date(s.fechaInicio);
    const end = new Date(s.fechaFinalizacion);
    let statusText = '';
    if (start > now) statusText = 'Programado';
    else if (end < now) statusText = 'Finalizado';
    else statusText = 'Activo';

    document.getElementById('detail-content').innerHTML = `
      <div class="detail-grid">
        <div class="detail-item full-width">
          <span class="detail-label">Nombre Completo</span>
          <span class="detail-value">${this.escapeHtml(s.nombres)} ${this.escapeHtml(s.apellidos)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Número de Documento</span>
          <span class="detail-value" style="font-family: monospace;">${this.escapeHtml(s.documento)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Expedición</span>
          <span class="detail-value">${this.escapeHtml(s.expedicion || 'No especificada')}</span>
        </div>
        <div class="detail-item full-width">
          <span class="detail-label">Cargo</span>
          <span class="detail-value">${this.escapeHtml(s.cargo)}</span>
        </div>
        <div class="detail-item full-width">
          <span class="detail-label">Funciones Específicas</span>
          <span class="detail-value">${this.escapeHtml(s.funciones || 'No especificadas')}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Fecha de Inicio</span>
          <span class="detail-value">${this.formatDate(s.fechaInicio)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Fecha de Finalización</span>
          <span class="detail-value">${this.formatDate(s.fechaFinalizacion)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Meses de Duración</span>
          <span class="detail-value">${s.mesesDuracion} meses</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Consecutivo</span>
          <span class="detail-value">${this.escapeHtml(s.consecutivo)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Estado</span>
          <span class="detail-value">${statusText}</span>
        </div>
      </div>`;

    document.getElementById('detail-title').textContent = 'Detalle del Estudiante';
    this.openModal('detail-modal');
  }

  confirmDelete(id) {
    const s = this.store.getById(id);
    if (!s) return;

    document.getElementById('confirm-content').innerHTML = `
      <div class="confirm-body">
        <div class="confirm-icon">${SVG.exclamationTriangle}</div>
        <h3 class="confirm-title">Eliminar Estudiante</h3>
        <p class="confirm-text">
          ¿Estás seguro de eliminar el registro de
          <strong>${this.escapeHtml(s.nombres)} ${this.escapeHtml(s.apellidos)}</strong>?
          Esta acción no se puede deshacer.
        </p>
      </div>`;

    document.getElementById('confirm-accept').onclick = async () => {
      try {
        await this.store.delete(id);
        this.closeModal('confirm-modal');
        this.showToast('Estudiante eliminado correctamente', 'success');
        this.render();
      } catch (err) {
        console.error('Failed to delete student', err);
        this.showToast(err.message || 'No se pudo eliminar el estudiante', 'error');
      }
    };

    this.openModal('confirm-modal');
  }

  // ---- Modals ----

  openModal(id) {
    document.getElementById(id)?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal(id) {
    document.getElementById(id)?.classList.remove('active');
    const anyOpen = document.querySelector('.modal-overlay.active');
    if (!anyOpen) document.body.style.overflow = '';
  }

  // ---- Toast ----

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const iconMap = {
      success: SVG.checkCircle,
      error: SVG.exclamationTriangle,
      info: SVG.informationCircle,
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${iconMap[type] || iconMap.info}</span>
      <span class="toast-message">${this.escapeHtml(message)}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">${SVG.x}</button>`;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // ---- Helpers ----

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatRemaining(endDate) {
    const diffDays = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return '0 días restantes';
    if (diffDays < 30) return `${diffDays} día${diffDays === 1 ? '' : 's'} restante${diffDays === 1 ? '' : 's'}`;
    const months = Math.round(diffDays / 30);
    return `${months} mes${months === 1 ? '' : 'es'} restante${months === 1 ? '' : 's'}`;
  }

  // ---- Navegación móvil ----

  toggleMobileNav() {
    document.getElementById('navbar-links')?.classList.toggle('open');
  }

  closeMobileNav() {
    document.getElementById('navbar-links')?.classList.remove('open');
  }


  // ---- Events ----

  bindEvents() {
    // Cerrar modales al hacer clic en el overlay
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    // Cerrar modales con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach((m) => {
          m.classList.remove('active');
        });
        document.body.style.overflow = '';
      }
    });

    // Cerrar el menú móvil al hacer clic fuera de la navbar
    document.addEventListener('click', (e) => {
      const navbar = document.querySelector('.navbar');
      if (navbar && !navbar.contains(e.target)) {
        this.closeMobileNav();
      }
    });
  }
}

// Initialize
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new App();
  app.init();
});
