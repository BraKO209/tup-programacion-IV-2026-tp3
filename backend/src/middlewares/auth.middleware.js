import passport from '../config/passport.js';

/**
 * Middleware para proteger rutas mediante Passport y JWT.
 * Devuelve 401 si no está autenticado o el token es inválido/expirado.
 */
export const requireAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        error: 'Error interno en la autenticación.',
        details: err.message
      });
    }

    if (!user) {
      return res.status(401).json({
        error: 'No autorizado.',
        message: info && info.message ? info.message : 'Token inválido, ausente o expirado. Debe iniciar sesión.'
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};
