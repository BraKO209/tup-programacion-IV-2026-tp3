import { param } from 'express-validator';

export const idParamValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El parámetro ID debe ser un número entero positivo válido.')
];
