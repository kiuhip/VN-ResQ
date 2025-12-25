import { Router } from 'express';
import { incidentController } from '../controllers/incident.controller';

const router = Router();

router.post('/', incidentController.create.bind(incidentController));
router.get('/', incidentController.getAll.bind(incidentController));
router.delete('/:id', incidentController.delete.bind(incidentController));
router.get('/stream', incidentController.stream.bind(incidentController));

export const incidentRoutes = router;
