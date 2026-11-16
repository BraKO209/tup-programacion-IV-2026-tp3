import { validationResult } from 'express-validator';

/**
 * Middleware para procesar los resultados de express-validator.
 * Si existen errores de validación, responde con código HTTP 400 Bad Request.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Error de validación en los datos enviados.',
      detalles: errors.array().map(err => ({
        campo: err.path || err.param,
        mensaje: err.msg,
        valorRecibido: err.value
      }))
    });
  }
  next();
};
