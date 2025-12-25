import { Router } from 'express';
import { assignmentController } from '../controllers/assignment.controller';

const router = Router();

router.patch('/:id', assignmentController.updateStatus.bind(assignmentController));

export const assignmentRoutes = router;
