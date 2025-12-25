import { Router } from 'express';
import { incidentService } from '../services/incident.service';

const router = Router();

// Facebook Webhook Verification
router.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'resq_verify_token';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

// Facebook Webhook Event Handler
router.post('/webhook', async (req, res) => {
    const body = req.body;

    console.log("📨 Webhook Received:", JSON.stringify(body, null, 2));

    if (body.object === 'page') {
        // Iterate over each entry - there may be multiple if batched
        for (const entry of body.entry) {
            // Iterate over each messaging event
            if (entry.messaging) {
                for (const event of entry.messaging) {
                    if (event.message && event.message.text) {
                        const senderId = event.sender.id;
                        const messageText = event.message.text;

                        console.log(`💬 Message from ${senderId}: ${messageText}`);

                        // Process with AI (internally in service) and Create Incident
                        await incidentService.createFromText('facebook', messageText);
                    }
                }
            }
        }
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

router.get('/', (req, res) => {
    res.json({ message: 'Messenger API Ready' });
});

export const messengerRoutes = router;
