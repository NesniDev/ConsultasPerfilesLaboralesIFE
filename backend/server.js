// dotenv es solo para desarrollo local (carga .env). En Vercel (y en cPanel
// vía Node.js App Manager) las env vars ya vienen en process.env, así que
// evitamos importar dotenv ahí para no depender de un paquete que algunos
// bundlers serverless no resuelven en runtime.
if (!process.env.VERCEL) {
  const dotenv = await import('dotenv');
  dotenv.config();
}

// IMPORTANT: These imports MUST come AFTER setting fallback environment variables
import express from 'express';
import cors from 'cors';
import { supabase } from './src/lib/supabase.js';
import { json } from './src/lib/http.js';
import { validateCreate, validateUpdate } from './src/lib/validation.js';
import { toApiPayload, toUiModel } from './src/lib/mapping.js';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:4321',      // Astro dev server
    'http://localhost',
    'https://localhost:4321',
    'https://ifecolombia.edu.co',
    'https://www.ifecolombia.edu.co',
    process.env.FRONTEND_URL || 'https://ifecolombia.edu.co'
  ],
  credentials: true
}));

// Backend URL (informativo): https://perfilab.ifecolombia.edu.co

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Backend running', timestamp: new Date().toISOString() });
});

// ============ AUTH HELPERS ============
// El login y el cambio de contraseña se hacen client-side contra Supabase Auth
// (window.supabaseAuth) — ver src/scripts/app.js. Este backend solo necesita
// validar el access_token de Supabase para proteger las rutas de escritura.

async function requireAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'No autorizado', status: 401 };
  }

  const token = authHeader.slice(7);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return { error: 'Token inválido o expirado', status: 401 };
  }

  return { user: data.user };
}

async function requireAdmin(req) {
  const auth = await requireAuth(req);
  if (auth.error) return auth;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Se requiere rol admin', status: 403 };
  }

  return auth;
}

// ============ ESTUDIANTES ROUTES ============

// GET all estudiantes
app.get('/api/estudiantes', async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from('Estudiantes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data: students || [] });
  } catch (err) {
    console.error('GET estudiantes error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST create estudiante
app.post('/api/estudiantes', async (req, res) => {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) {
      return res.status(auth.status).json({ error: auth.error });
    }

    const validation = validateCreate(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const payload = toApiPayload(req.body);

    const { data, error } = await supabase
      .from('Estudiantes')
      .insert([payload])
      .select();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Documento duplicado' });
      }
      throw error;
    }

    const uiData = toUiModel(data[0]);
    res.status(201).json({ data: uiData });
  } catch (err) {
    console.error('POST estudiante error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET one estudiante
app.get('/api/estudiantes/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Estudiantes')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'No encontrado' });
    }

    const uiData = toUiModel(data);
    res.json({ data: uiData });
  } catch (err) {
    console.error('GET one error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update estudiante
app.put('/api/estudiantes/:id', async (req, res) => {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) {
      return res.status(auth.status).json({ error: auth.error });
    }

    const validation = validateUpdate(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const payload = toApiPayload(req.body);

    const { data, error } = await supabase
      .from('Estudiantes')
      .update(payload)
      .eq('id', req.params.id)
      .select();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Documento duplicado' });
      }
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No encontrado' });
    }

    const uiData = toUiModel(data[0]);
    res.json(uiData);
  } catch (err) {
    console.error('PUT error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE estudiante
app.delete('/api/estudiantes/:id', async (req, res) => {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) {
      return res.status(auth.status).json({ error: auth.error });
    }

    const { error } = await supabase
      .from('Estudiantes')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Backend running on port ${PORT}`);
  console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || 'https://ifecolombia.edu.co'}`);
});
