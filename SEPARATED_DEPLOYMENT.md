# Despliegue Separado: Frontend + Backend

El proyecto está configurado para desplegar **frontend estático** en cPanel y **backend API** en un servidor separado.

## Estructura

```
Frontend (HTML/CSS/JS estático)
├── Ubicación: cPanel public_html/
├── URL: https://tudominio.com
└── Build: npm run build → dist/

Backend (Node.js API)
├── Ubicación: Servidor separado o subdominio
├── URL: https://perfilab.ifecolombia.edu.co
└── Rutas: /api/estudiantes/* (login y cambio de password van directo contra Supabase Auth, no pasan por este backend — ver BACKEND_SETUP.md)
```

## Frontend en cPanel

### 1. Compilar

```bash
npm run build
```

Genera `dist/` con archivos HTML/CSS/JS estáticos puros.

### 2. Subir a cPanel

1. Conéctate via FTP a `public_html/`
2. Sube todo el contenido de `dist/`:
   ```
   index.html
   _astro/
   LOGO-IFE.png
   ```

3. **No necesita Node.js instalado** - es contenido estático

### 3. Verificar

Abre `https://tudominio.com` - deberías ver la página cargada.

## Backend en Servidor Separado

### 1. Crear directorio backend

Crea una carpeta separada o usa un servidor diferente:
```
backend/
├── src/
│   ├── pages/api/
│   │   ├── auth/
│   │   │   ├── login.js
│   │   │   ├── change-password.js
│   │   │   └── logout.js
│   │   └── estudiantes/
│   ├── lib/
│   │   ├── supabase.js
│   │   ├── validation.js
│   │   ├── mapping.js
│   │   └── http.js
│   └── pages/
├── package.json
├── .env
└── server.js (Express o similar)
```

### 2. Crear servidor Express

**backend/server.js:**
```javascript
import express from 'express';
import cors from 'cors';
import { supabase } from './src/lib/supabase.js';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS para permitir frontend
app.use(cors({
  origin: 'https://tudominio.com',
  credentials: true
}));

app.use(express.json());

// Rutas de autenticación
app.post('/api/auth/login', async (req, res) => {
  // Implementación del login
});

app.post('/api/auth/change-password', async (req, res) => {
  // Implementación del cambio de contraseña
});

// Rutas de estudiantes
app.get('/api/estudiantes', async (req, res) => {
  // GET list
});

app.post('/api/estudiantes', async (req, res) => {
  // POST create
});

app.get('/api/estudiantes/:id', async (req, res) => {
  // GET one
});

app.put('/api/estudiantes/:id', async (req, res) => {
  // PUT update
});

app.delete('/api/estudiantes/:id', async (req, res) => {
  // DELETE
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
```

### 3. Variables de entorno (.env)

```env
SUPABASE_URL=https://zjjcsmcojstgpfnircnb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<tu secret key — Project Settings > API Keys > Secret keys>
PORT=3000
NODE_ENV=production
```

### 4. package.json del backend

```json
{
  "name": "ife-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "dev": "node server.js",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

### 5. Desplegar backend

**Opción A: cPanel (otro Node.js app)**
1. En cPanel Node.js App Manager
2. Crea otra aplicación en un subdominio: `api.tudominio.com`
3. Apunta a `server.js`

**Opción B: Hosting alternativo**
- Vercel (gratuito para APIs)
- Render.com
- Railway
- Heroku
- DigitalOcean

## Configurar URL del backend

En el frontend, cambia `src/scripts/config.js`:

```javascript
export const API_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://perfilab.ifecolombia.edu.co';  // ← Cambia esto
```

Luego: `npm run build` y sube a cPanel.

## CORS

El backend **debe permitir** el frontend con CORS:

```javascript
app.use(cors({
  origin: ['https://tudominio.com', 'https://www.tudominio.com'],
  credentials: true
}));
```

## Resumen

| Parte | Ubicación | Tecnología | URL |
|-------|-----------|-----------|-----|
| Frontend | cPanel public_html/ | HTML/CSS/JS estático | https://tudominio.com |
| Backend | Servidor separado | Node.js/Express | https://perfilab.ifecolombia.edu.co |
| Database | Supabase | PostgreSQL | - |

## Ventajas

✅ Frontend ultrarrápido (sin Node.js)
✅ Backend escalable independientemente
✅ Fácil de cachear con CDN
✅ Mejor rendimiento general
✅ Backend puede estar en cualquier servidor

## Desventajas

❌ CORS necesita configuración
❌ Dos dominios a mantener
❌ Más complejo que juntos

¿Preguntas?
