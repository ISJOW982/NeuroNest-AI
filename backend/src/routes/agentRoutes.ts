import { Router } from 'express';
import { processMessage, getAgents } from '../controllers/agentController';

const router = Router();

// GET /api/agents - Get information about available agents
router.get('/', getAgents);

// POST /api/agents/process - Process a message through the agent system
router.post('/process', processMessage);

export default router;