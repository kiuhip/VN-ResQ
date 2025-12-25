import { Router } from 'express';
import { teamController } from '../controllers/team.controller';

const router = Router();

router.get('/', teamController.getAll.bind(teamController));
router.post('/:id/location', teamController.updateLocation.bind(teamController));
router.post('/:id/status', teamController.updateStatus.bind(teamController));
router.get('/:id/assignments', teamController.getAssignments.bind(teamController));

export const teamRoutes = router;
