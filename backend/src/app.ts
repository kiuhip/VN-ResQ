import express from 'express';
import cors from 'cors';
import { incidentRoutes } from './routes/incident.routes';
import { hotlineRoutes } from './routes/hotline.routes';
import { messengerRoutes } from './routes/messenger.routes';
import { dispatchRoutes } from './routes/dispatch.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/incidents', incidentRoutes);
app.use('/api/hotline', hotlineRoutes);
app.use('/api/messenger', messengerRoutes);
app.use('/api/dispatch', dispatchRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send('VN-ResQ Backend is running!');
});

export default app;
