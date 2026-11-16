import { Router } from 'express';
import { register, login, profile } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas públicas de autenticación
router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);

// Ruta protegida con JWT y Passport
router.get('/profile', requireAuth, profile);

export default router;
