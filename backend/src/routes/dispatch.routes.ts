import { Router } from 'express';
import { dispatchController } from '../controllers/dispatch.controller';

const router = Router();

router.post('/', dispatchController.dispatch.bind(dispatchController));

export const dispatchRoutes = router;
