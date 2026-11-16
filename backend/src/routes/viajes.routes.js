import { Router } from 'express';
import {
  getAllViajes,
  getViajeById,
  createViaje,
  updateViaje,
  deleteViaje,
  getHistorialByVehiculo,
  getHistorialByConductor,
  getEstadisticasKilometros
} from '../controllers/viajes.controller.js';
import {
  createViajeValidator,
  updateViajeValidator,
  filtroViajesQueryValidator
} from '../validators/viajes.validator.js';
import { idParamValidator } from '../validators/common.validator.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las operaciones CRUD y reportes requieren autenticación con JWT
router.use(requireAuth);

// Rutas de reportes y estadísticas (antes de :id)
router.get('/estadisticas/kilometros', getEstadisticasKilometros);
router.get('/historial/vehiculo/:id', idParamValidator, validateRequest, getHistorialByVehiculo);
router.get('/historial/conductor/:id', idParamValidator, validateRequest, getHistorialByConductor);

// Operaciones CRUD
router.get('/', filtroViajesQueryValidator, validateRequest, getAllViajes);
router.get('/:id', idParamValidator, validateRequest, getViajeById);
router.post('/', createViajeValidator, validateRequest, createViaje);
router.put('/:id', updateViajeValidator, validateRequest, updateViaje);
router.delete('/:id', idParamValidator, validateRequest, deleteViaje);

export default router;
