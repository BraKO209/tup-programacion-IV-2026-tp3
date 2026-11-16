import { body, param } from 'express-validator';

const anioActual = new Date().getFullYear();

export const createVehiculoValidator = [
  body('marca')
    .trim()
    .notEmpty().withMessage('La marca del vehículo es obligatoria.')
    .isLength({ min: 2, max: 100 }).withMessage('La marca debe tener entre 2 y 100 caracteres.'),
  body('modelo')
    .trim()
    .notEmpty().withMessage('El modelo del vehículo es obligatorio.')
    .isLength({ min: 1, max: 100 }).withMessage('El modelo debe tener entre 1 y 100 caracteres.'),
  body('patente')
    .trim()
    .notEmpty().withMessage('La patente es obligatoria.')
    .isLength({ min: 6, max: 10 }).withMessage('La patente debe tener entre 6 y 10 caracteres.')
    .matches(/^[A-Za-z0-9\s-]+$/).withMessage('La patente solo puede contener letras, números y guiones.'),
  body('anio')
    .notEmpty().withMessage('El año es obligatorio.')
    .isInt({ min: 1950, max: anioActual + 1 })
    .withMessage(`El año debe ser un número entero entre 1950 y ${anioActual + 1}.`),
  body('capacidad_carga')
    .notEmpty().withMessage('La capacidad de carga es obligatoria.')
    .isFloat({ min: 0.01 })
    .withMessage('La capacidad de carga debe ser un número decimal positivo mayor a 0.')
];

export const updateVehiculoValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del vehículo debe ser un número entero positivo.'),
  ...createVehiculoValidator
];
