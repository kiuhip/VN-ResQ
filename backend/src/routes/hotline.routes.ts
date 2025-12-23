import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Hotline API not implemented' });
});

export const hotlineRoutes = router;
