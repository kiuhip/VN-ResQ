import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Messenger API not implemented' });
});

export const messengerRoutes = router;
