import { Router } from 'express';
import multer from 'multer';
import { aiService } from '../services/ai.service';
import { incidentService } from '../services/incident.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', (req, res) => {
    res.json({ message: 'Hotline API Ready' });
});

router.post('/transcribe-audio', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        console.log(`🎤 Transcribing Audio: ${req.file.originalname}`);

        // Send to Gemini Multimodal
        const result = await aiService.analyzeAudio(req.file.buffer, req.file.mimetype);

        // Return the extracted info (especially description/transcript) without saving
        res.json({ success: true, transcription: result.description, extraction: result });

    } catch (error) {
        console.error("Transcription failed", error);
        res.status(500).json({ error: 'Failed to transcribe audio' });
    }
});

export const hotlineRoutes = router;
