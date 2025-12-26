import { Router } from 'express';
import { mapController } from '../controllers/map.controller';

const router = Router();

router.get('/config/:provinceId', mapController.getConfig);

export const mapRoutes = router;
