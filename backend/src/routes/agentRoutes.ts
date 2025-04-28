import express, { Request, Response } from 'express';
import { processMessage, getAgents, getProviders } from '../controllers/agentController';

const router = express.Router();

// GET /api/agents - Get information about available agents
router.get('/', (req: Request, res: Response) => getAgents(req, res));

// GET /api/agents/providers - Get supported AI providers
router.get('/providers', (req: Request, res: Response) => getProviders(req, res));

// POST /api/agents/process - Process a message through the agent system
router.post('/process', (req: Request, res: Response) => processMessage(req, res));

export default router;