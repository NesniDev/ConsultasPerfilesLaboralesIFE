# Backend Setup - Node.js/Express

El backend está en la carpeta `backend/` y proporciona todas las rutas API necesarias.

## Estructura

```
backend/
├── server.js (servidor principal)
├── package.json
├── .env (crear con tus valores)
└── src/lib/
    ├── supabase.js
    ├── validation.js
    ├── mapping.js
    └── http.js
```

> El login y el cambio de contraseña se hacen client-side contra Supabase Auth
> directamente (ver `src/scripts/app.js`). Este backend solo expone las rutas
> de `Estudiantes` y valida el token de Supabase para las escrituras.

## Instalación Local

### 1. Entrar en carpeta backend

```bash
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear archivo .env

Copia los valores de `.env.example` y crea `.env`:

```env
SUPABASE_URL=https://zjjcsmcojstgpfnircnb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<tu secret key de Supabase — Project Settings > API Keys > Secret keys>
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

> Nunca commitees el valor real de `SUPABASE_SERVICE_ROLE_KEY` — `.env` está gitignored a propósito.

### 4. Ejecutar localmente

```bash
npm run dev
```

Debería mostrar:
```
✓ Backend running on port 3000
✓ Frontend URL: http://localhost:3000
```

---

## Desplegar en cPanel

### 1. Preparar

```bash
cd backend
npm install
```

### 2. Subir a cPanel

1. En cPanel → **Node.js App Manager**
2. Click **"Create an Application"**
3. Configura:
   - **Node.js Version:** 22.12.0+
   - **Application Root:** `/home/usuario/backend/`
   - **Application Startup File:** `server.js`
   - **Application URL:** `perfilab.ifecolombia.edu.co` (subdominio)

4. Click **"Create"**

### 3. Agregar variables de entorno

En cPanel Node.js App Manager → Environment Variables:

```
SUPABASE_URL=https://zjjcsmcojstgpfnircnb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[tu_clave]
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://ifecolombia.edu.co
```

### 4. Reiniciar

Click en **"Restart"** en el Node.js App Manager

---

## Desplegar en Vercel

### 1. Crear `vercel.json` en backend/

```json
{
  "buildCommand": "npm install",
  "startCommand": "node server.js",
  "env": {
    "SUPABASE_URL": "@supabase_url",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
    "FRONTEND_URL": "@frontend_url"
  }
}
```

### 2. Conectar a Vercel

```bash
cd backend
vercel
```

### 3. Agregar environment variables en Vercel Dashboard

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_URL`

---

## Rutas disponibles

### Estudiantes
- `GET /api/estudiantes` - Listar todos
- `POST /api/estudiantes` - Crear nuevo
- `GET /api/estudiantes/:id` - Obtener uno
- `PUT /api/estudiantes/:id` - Actualizar
- `DELETE /api/estudiantes/:id` - Eliminar

---

## CORS

El backend permite estas URLs por defecto:
- `http://localhost:3000`
- `https://ifecolombia.edu.co`
- `https://www.ifecolombia.edu.co`

Edita `server.js` en la sección CORS si necesitas agregar más URLs.

---

## Troubleshooting

**Puerto ocupado:**
```bash
PORT=3001 npm run dev
```

**Supabase error:**
- Verifica que las claves en `.env` sean exactas
- Revisa que la tabla `Estudiantes` exista en Supabase

**CORS error:**
- Agrega tu URL frontend a la lista de CORS en `server.js`

---

## Siguiente paso

Una vez el backend esté corriendo, actualiza en frontend:

`src/scripts/config.js`:
```javascript
export const API_BASE_URL = 'https://perfilab.ifecolombia.edu.co';
```

Luego: `npm run build` y sube el contenido de `dist/` a `public_html/perfiles-laborales/` en cPanel.
