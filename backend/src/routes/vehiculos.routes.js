import { Router } from 'express';
import {
  getAllVehiculos,
  getVehiculoById,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo
} from '../controllers/vehiculos.controller.js';
import {
  createVehiculoValidator,
  updateVehiculoValidator
} from '../validators/vehiculos.validator.js';
import { idParamValidator } from '../validators/common.validator.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las operaciones CRUD requieren autenticación con JWT
router.use(requireAuth);

router.get('/', getAllVehiculos);
router.get('/:id', idParamValidator, validateRequest, getVehiculoById);
router.post('/', createVehiculoValidator, validateRequest, createVehiculo);
router.put('/:id', updateVehiculoValidator, validateRequest, updateVehiculo);
router.delete('/:id', idParamValidator, validateRequest, deleteVehiculo);

export default router;
