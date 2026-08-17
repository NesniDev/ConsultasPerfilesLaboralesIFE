import express from 'express';
import cors from 'cors';
import { supabase } from './src/lib/supabase.js';
import { verifyJWT, comparePassword, hashPassword } from './src/lib/auth.js';
import { json } from './src/lib/http.js';
import { validateCreate, validateUpdate } from './src/lib/validation.js';
import { toApiPayload, toUiModel } from './src/lib/mapping.js';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost',
    'https://tudominio.edu.co',
    'https://www.tudominio.edu.co',
    'https://tudominio.edu.co/app',
    process.env.FRONTEND_URL || 'https://tudominio.edu.co'
  ],
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Backend running', timestamp: new Date().toISOString() });
});

// ============ AUTH ROUTES ============

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generate JWT token
    const token = await generateJWT({ userId: user.id, email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: 'admin'
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Change password
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const token = authHeader.slice(7);
    const payload = verifyJWT(token);

    if (!payload || !payload.userId) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseñas requeridas' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Mínimo 6 caracteres' });
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('id', payload.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verify current password
    const passwordMatch = await comparePassword(currentPassword, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Hash and update new password
    const newPasswordHash = await hashPassword(newPassword);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
      .eq('id', payload.userId);

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(500).json({ error: 'Error al actualizar' });
    }

    res.json({ success: true, message: 'Contraseña actualizada' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ ESTUDIANTES ROUTES ============

// GET all estudiantes
app.get('/api/estudiantes', async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from('Estudiantes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(students || []);
  } catch (err) {
    console.error('GET estudiantes error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST create estudiante
app.post('/api/estudiantes', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado' });
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
    res.status(201).json(uiData);
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
    res.json(uiData);
  } catch (err) {
    console.error('GET one error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update estudiante
app.put('/api/estudiantes/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado' });
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
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado' });
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
  console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || 'https://tudominio.edu.co'}`);
});

// Helper function to generate JWT (using a simple approach)
async function generateJWT(payload) {
  // In production, use a proper JWT library
  // For now, using a simple base64 encoding
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa('dummy-signature'); // Replace with actual HMAC in production
  return `${header}.${body}.${signature}`;
}
