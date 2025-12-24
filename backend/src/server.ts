import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { simulationService } from './services/simulation.service';

const PORT = process.env.PORT || 3000;

// Start Simulation Background Job
simulationService.start();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
