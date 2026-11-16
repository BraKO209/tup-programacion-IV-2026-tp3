import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

// Registro de un nuevo usuario
export const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // Verificamos si el correo ya existe
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        error: 'El correo electrónico ya está registrado.'
      });
    }

    // Hashear la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardar el nuevo usuario en MySQL
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, hashedPassword]
    );

    return res.status(201).json({
      message: 'Usuario registrado con éxito.',
      usuario: {
        id: result.insertId,
        nombre,
        email
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return res.status(500).json({
      error: 'Error interno del servidor al registrar el usuario.',
      details: error.message
    });
  }
};

// Login de usuario y generación de token JWT (expira a las 4 horas)
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas. Email o contraseña incorrectos.'
      });
    }

    const user = users[0];

    // Comparar la contraseña con el hash de bcrypt
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        error: 'Credenciales inválidas. Email o contraseña incorrectos.'
      });
    }

    // Generar el token con 4 horas de expiración
    const secret = process.env.JWT_SECRET || 'super_secreto_utn_prog4_2026_jwt_key';
    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        email: user.email
      },
      secret,
      { expiresIn: '4h' }
    );

    return res.status(200).json({
      message: 'Sesión iniciada con éxito.',
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      error: 'Error interno del servidor al iniciar sesión.',
      details: error.message
    });
  }
};

// Obtener perfil del usuario autenticado
export const profile = async (req, res) => {
  return res.status(200).json({
    usuario: req.user
  });
};
