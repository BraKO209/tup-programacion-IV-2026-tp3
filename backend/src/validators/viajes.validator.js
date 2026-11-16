import { body, param, query } from 'express-validator';

export const createViajeValidator = [
  body('vehiculo_id')
    .notEmpty().withMessage('El ID de vehículo es obligatorio.')
    .isInt({ min: 1 }).withMessage('El ID de vehículo debe ser un número entero positivo.'),
  body('conductor_id')
    .notEmpty().withMessage('El ID de conductor es obligatorio.')
    .isInt({ min: 1 }).withMessage('El ID de conductor debe ser un número entero positivo.'),
  body('fecha_salida')
    .notEmpty().withMessage('La fecha y hora de salida es obligatoria.')
    .isISO8601().withMessage('La fecha de salida debe tener un formato de fecha válido (ISO8601 / YYYY-MM-DD HH:mm).'),
  body('fecha_llegada')
    .notEmpty().withMessage('La fecha y hora de llegada es obligatoria.')
    .isISO8601().withMessage('La fecha de llegada debe tener un formato de fecha válido (ISO8601 / YYYY-MM-DD HH:mm).')
    .custom((value, { req }) => {
      if (req.body.fecha_salida && new Date(value) < new Date(req.body.fecha_salida)) {
        throw new Error('La fecha de llegada no puede ser anterior a la fecha de salida.');
      }
      return true;
    }),
  body('origen')
    .trim()
    .notEmpty().withMessage('La ciudad/lugar de origen es obligatorio.')
    .isLength({ min: 2, max: 150 }).withMessage('El origen debe tener entre 2 y 150 caracteres.'),
  body('destino')
    .trim()
    .notEmpty().withMessage('La ciudad/lugar de destino es obligatorio.')
    .isLength({ min: 2, max: 150 }).withMessage('El destino debe tener entre 2 y 150 caracteres.'),
  body('kilometros')
    .notEmpty().withMessage('Los kilómetros son obligatorios.')
    .isFloat({ min: 0.1 }).withMessage('Los kilómetros deben ser un número positivo mayor a 0.'),
  body('observaciones')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 1000 }).withMessage('Las observaciones no pueden exceder los 1000 caracteres.')
];

export const updateViajeValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del viaje debe ser un número entero positivo.'),
  ...createViajeValidator
];

export const filtroViajesQueryValidator = [
  query('vehiculo_id')
    .optional()
    .isInt({ min: 1 }).withMessage('vehiculo_id debe ser un entero positivo.'),
  query('conductor_id')
    .optional()
    .isInt({ min: 1 }).withMessage('conductor_id debe ser un entero positivo.')
];
