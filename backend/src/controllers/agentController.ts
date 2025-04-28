import { Request, Response } from 'express';
import { OrchestratorAgent } from '../agents';

// Create a singleton instance of the orchestrator
const orchestrator = new OrchestratorAgent();

/**
 * Process a message through the agent system
 * @param req Express request
 * @param res Express response
 */
export const processMessage = async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const responses = await orchestrator.process(message, context);
    
    return res.status(200).json({ responses });
  } catch (error) {
    console.error('Error processing message:', error);
    return res.status(500).json({ error: 'Failed to process message' });
  }
};

/**
 * Get information about available agents
 * @param req Express request
 * @param res Express response
 */
export const getAgents = (req: Request, res: Response) => {
  try {
    const agents = [
      {
        name: orchestrator.getName(),
        description: orchestrator.getDescription()
      }
    ];
    
    return res.status(200).json({ agents });
  } catch (error) {
    console.error('Error getting agents:', error);
    return res.status(500).json({ error: 'Failed to get agents' });
  }
};