import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

/**
 * Registro de un nuevo usuario
 */
export const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // Verificar si el correo ya está registrado
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        error: 'El correo electrónico ya se encuentra registrado.'
      });
    }

    // Hashear contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardar usuario en la base de datos
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, hashedPassword]
    );

    return res.status(201).json({
      message: 'Usuario registrado correctamente.',
      usuario: {
        id: result.insertId,
        nombre,
        email
      }
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({
      error: 'Error interno al registrar el usuario.',
      details: error.message
    });
  }
};

/**
 * Inicio de sesión de usuario y generación de token JWT (expiración: 4 horas)
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas. Correo o contraseña incorrectos.'
      });
    }

    const user = users[0];

    // Comparar contraseña con el hash de bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Credenciales inválidas. Correo o contraseña incorrectos.'
      });
    }

    // Crear token JWT con expiración fija a 4 horas
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
      message: 'Inicio de sesión exitoso.',
      token,
      expiresIn: '4 horas',
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      error: 'Error interno al iniciar sesión.',
      details: error.message
    });
  }
};

/**
 * Obtener perfil del usuario autenticado actual
 */
export const profile = async (req, res) => {
  return res.status(200).json({
    usuario: req.user
  });
};
