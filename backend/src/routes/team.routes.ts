import { Router } from 'express';
import { teamController } from '../controllers/team.controller';

const router = Router();

router.get('/', teamController.getAll.bind(teamController));

export const teamRoutes = router;
