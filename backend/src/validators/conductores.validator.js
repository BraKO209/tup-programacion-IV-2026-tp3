import { body, param } from 'express-validator';

export const createConductorValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.'),
  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio.')
    .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres.'),
  body('numero_documento')
    .trim()
    .notEmpty().withMessage('El número de documento es obligatorio.')
    .isLength({ min: 6, max: 20 }).withMessage('El número de documento debe tener entre 6 y 20 caracteres.')
    .matches(/^[A-Za-z0-9.]+$/).withMessage('El número de documento solo puede contener números, letras o puntos.'),
  body('numero_licencia')
    .trim()
    .notEmpty().withMessage('El número de licencia es obligatorio.')
    .isLength({ min: 4, max: 50 }).withMessage('El número de licencia debe tener entre 4 y 50 caracteres.'),
  body('fecha_alta_licencia')
    .notEmpty().withMessage('La fecha de alta de licencia es obligatoria.')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('La fecha de alta debe tener el formato YYYY-MM-DD.'),
  body('fecha_vencimiento_licencia')
    .notEmpty().withMessage('La fecha de vencimiento de licencia es obligatoria.')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('La fecha de vencimiento debe tener el formato YYYY-MM-DD.')
    .custom((value, { req }) => {
      if (req.body.fecha_alta_licencia && new Date(value) <= new Date(req.body.fecha_alta_licencia)) {
        throw new Error('La fecha de vencimiento debe ser posterior a la fecha de alta de la licencia.');
      }
      return true;
    })
];

export const updateConductorValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del conductor debe ser un número entero positivo.'),
  ...createConductorValidator
];
