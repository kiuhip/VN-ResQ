import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Dispatch API not implemented' });
});

export const dispatchRoutes = router;
