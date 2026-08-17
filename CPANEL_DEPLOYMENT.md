# Despliegue en cPanel (DESACTUALIZADO)

> ⚠️ Este documento describe la arquitectura vieja (Astro + `@astrojs/node` standalone).
> El proyecto ya migró a **frontend estático + backend Express separado**.
> Usá **SEPARATED_DEPLOYMENT.md** y **BACKEND_SETUP.md** en su lugar.

El proyecto está configurado para desplegar en cPanel con Node.js standalone.

## Requisitos

- cPanel con Node.js habilitado (versión 22.12.0+)
- npm instalado
- Acceso SSH o File Manager

## Instrucciones de Despliegue

### 1. Preparar el build local

```bash
npm run build
```

Esto genera la carpeta `dist/` con el servidor Node.js listo para producción.

### 2. Subir los archivos a cPanel

**Opción A: Via FTP/SFTP**
1. Conecta via FTP a tu servidor cPanel
2. Navega a la carpeta `public_html/` (o donde quieras alojar la app)
3. Sube:
   - `dist/` (carpeta compilada)
   - `node_modules/` (o ejecuta `npm install` en el servidor)
   - `.env` (variables de entorno)
   - `package.json`
   - `package-lock.json`

**Opción B: Via SSH/Git**
```bash
ssh usuario@tudominio.com
cd public_html/
git clone https://github.com/tu-usuario/tu-repo.git .
npm install
npm run build
```

### 3. Crear un "Node.js App" en cPanel

1. Abre **cPanel**
2. Busca **"Node.js App Manager"** (o "Node.js Selector")
3. Click en **"Create an Application"**
4. Configura:
   - **App Mode:** Development (o Production)
   - **Node.js Version:** 22.12.0 (o la disponible)
   - **Application Root:** `/home/usuario/public_html/` (la carpeta donde está `dist/`)
   - **Application Startup File:** `dist/server/entry.mjs`
   - **Application URL:** `tu-dominio.com` (sin www, o con www)

5. Click en **"Create"**

### 4. Verificar variables de entorno

En cPanel, en el Node.js App Manager:
1. Selecciona tu aplicación
2. Click en **"Environment Variables"**
3. Agrega:
   ```
   SUPABASE_URL=https://zjjcsmcojstgpfnircnb.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<tu secret key — Project Settings > API Keys > Secret keys>
   NODE_ENV=production
   ```

### 5. Reiniciar la aplicación

En cPanel Node.js App Manager:
- Click en tu app
- Click en **"Restart"**

### 6. Verificar que funciona

Abre `https://tu-dominio.com` en el navegador. Deberías ver la app funcionando.

## Troubleshooting

**Error: "Application failed to start"**
- Verifica que Node.js versión sea 22.12.0+
- Revisa los logs en cPanel
- Asegúrate que `dist/server/entry.mjs` existe

**Error: "Cannot find module"**
- Ejecuta `npm install` en el servidor
- Verifica que `node_modules` existe

**Error: "Supabase credentials not configured"**
- Verifica las Environment Variables en cPanel
- Las claves deben ser exactas (sin espacios)

**La app se carga pero sin estilos/scripts**
- Los archivos públicos deben estar en `dist/client/`
- cPanel debería servirlos automáticamente

## Cambiar la rama en producción

Si quieres actualizar desde GitHub:
```bash
cd /home/usuario/public_html/
git pull origin main
npm install
npm run build
# Reinicia la app en cPanel
```

## Puerto personalizado

cPanel asigna un puerto automáticamente. Si necesitas usarlo manualmente:
```bash
PORT=3000 node dist/server/entry.mjs
```

## Más información

- Docs de Astro + Node: https://docs.astro.build/en/guides/integrations-guide/node/
- cPanel Node.js: https://docs.cpanel.net/
