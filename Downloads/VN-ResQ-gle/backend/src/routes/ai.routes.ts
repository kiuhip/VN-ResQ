import { Router } from 'express';
import { aiService } from '../services/ai.service';

const router = Router();

router.post('/parse', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            res.status(400).json({ error: 'Text is required' });
            return;
        }
        const extraction = await aiService.extractInfoFromText(text);
        res.json(extraction);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export const aiRoutes = router;
