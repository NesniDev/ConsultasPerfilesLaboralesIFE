# Setup de Autenticación

## Paso 1: Ejecutar migración en Supabase

Copia y pega el contenido de `supabase/migrations/001_create_users_table.sql` en la Supabase console SQL editor y ejecuta.

Esto creará:
- Tabla `users` con columnas: id, email, password_hash, role, created_at, updated_at
- Usuario admin de demo:
  - **Admin**: admin@ife.edu / password123

## Paso 2: Configurar JWT_SECRET

Establece la variable de entorno `JWT_SECRET` en tu `.env.local`:

```
JWT_SECRET=tu-secreto-super-seguro-aleatorio
```

Genera un valor aleatorio fuerte, ej: `openssl rand -base64 32`

**Nota:** En producción (Vercel), agrega esto como variable de entorno:
```bash
vercel env add JWT_SECRET
```

## Paso 3: Flujo de acceso

### Acceso Público
- Link directo: https://consultas-perfiles-laborales-ife.vercel.app
- Pueden ver: Tabla de estudiantes, detalles, búsqueda
- NO pueden: Crear, editar, eliminar (botones ocultos)

### Acceso Administrador
1. Accede a https://consultas-perfiles-laborales-ife.vercel.app/login
2. Ingresa: `admin@ife.edu` / `password123`
3. Tendrás acceso a:
   - Ver estudiantes (como público)
   - Crear nuevos registros
   - Editar registros existentes
   - Eliminar registros
   - Botón de cerrar sesión en navbar

## Paso 4: Crear nuevos usuarios

En Supabase console, ejecuta:

```sql
INSERT INTO users (email, password_hash, role)
VALUES (
  'nuevo@ife.edu',
  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', -- password123
  'viewer' -- o 'admin'
);
```

Para cambiar la contraseña, genera el hash SHA-256 del nuevo password:
```bash
node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('nueva-password').digest('hex'))"
```

## Seguridad

### Producción
- Cambiar todos los passwords de demo
- Usar un JWT_SECRET fuerte y aleatorio
- Implementar bcrypt en lugar de SHA-256 para hashing
- Agregar rate limiting en `/api/auth/login`
- HTTPS obligatorio (ya en Vercel)

### Endpoints protegidos
- `POST /api/estudiantes` - Requiere admin
- `PUT /api/estudiantes/[id]` - Requiere admin
- `DELETE /api/estudiantes/[id]` - Requiere admin
- `GET /api/estudiantes` - Público (cualquier usuario autenticado)
- `GET /api/estudiantes/[id]` - Público (cualquier usuario autenticado)
