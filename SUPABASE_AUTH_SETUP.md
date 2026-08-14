# Supabase Auth Setup

## Cambios realizados

La autenticación ahora usa **Supabase Auth** en lugar de un endpoint personalizado. Esto es más seguro y profesional.

### Lo que cambió:
- ✅ `handleLogin()` ahora usa `supabase.auth.signInWithPassword()`
- ✅ `logout()` ahora usa `supabase.auth.signOut()`
- ✅ El endpoint `/api/auth/login` ya no es necesario
- ✅ Los tokens se manejan automáticamente a través de Supabase

## Configuración requerida

### 1. Agregar variables de entorno a `.env`

Necesitas agregar la clave pública de Supabase a tu `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**¿Cómo encontrar `SUPABASE_ANON_KEY`?**
1. Abre tu proyecto en Supabase: https://supabase.com
2. Vé a: Project Settings → API
3. Copia el valor de "anon public key"
4. Agrégalo a `.env` como `SUPABASE_ANON_KEY`

### 2. Crear usuario de prueba en Supabase Auth

Los usuarios ahora se crean en **Supabase Auth**, no en la tabla `users`.

**Opción A: Crear manualmente en Supabase Dashboard**
1. Abre tu proyecto en Supabase
2. Vé a: Authentication → Users
3. Click "Add user"
4. Ingresa email y contraseña
5. Confirm email (marca como verified)

**Opción B: Crear programáticamente**
```javascript
// En Supabase Console (SQL Editor)
-- Crear usuario en auth.users
SELECT * FROM auth.users;

-- O usa el endpoint Supabase Admin API
```

### 3. Notas importantes

- El campo de "usuario" en el login ahora espera un **email**, no un username
- La contraseña es validada por Supabase Auth automáticamente
- Las sesiones se manejan con JWT tokens (almacenados en localStorage)
- El cambio de contraseña (`/api/auth/change-password`) ahora también usará Supabase Auth

## Prueba el login

1. `npm run build`
2. Verifica que las variables de entorno están correctas
3. Intenta login con email y contraseña
4. Deberías ver "¡Sesión iniciada correctamente!" y la página se recargará

## ¿Qué hacer con el viejo endpoint `/api/auth/login`?

Puedes mantenerlo como respaldo o eliminarlo si no lo necesitas. Ya no se usa.

```bash
# Puedes eliminar:
rm src/pages/api/auth/login.js
```

## ¿Cambios de contraseña?

La ruta `/api/auth/change-password` necesitará actualización para usar `supabase.auth.updateUser()` en lugar de la tabla `users`. Se puede hacer en otra iteración.
