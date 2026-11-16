import { Router } from 'express';
import {
  getAllConductores,
  getConductorById,
  createConductor,
  updateConductor,
  deleteConductor
} from '../controllers/conductores.controller.js';
import {
  createConductorValidator,
  updateConductorValidator
} from '../validators/conductores.validator.js';
import { idParamValidator } from '../validators/common.validator.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las operaciones CRUD requieren autenticación con JWT
router.use(requireAuth);

router.get('/', getAllConductores);
router.get('/:id', idParamValidator, validateRequest, getConductorById);
router.post('/', createConductorValidator, validateRequest, createConductor);
router.put('/:id', updateConductorValidator, validateRequest, updateConductor);
router.delete('/:id', idParamValidator, validateRequest, deleteConductor);

export default router;
