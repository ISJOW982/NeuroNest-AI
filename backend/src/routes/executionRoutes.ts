import express, { Request, Response } from 'express';
import { 
  createProject, 
  createFile, 
  executeProject, 
  stopExecution, 
  getExecutionLogs 
} from '../controllers/executionController';

const router = express.Router();

// POST /api/execution/projects - Create a new project
router.post('/projects', (req: Request, res: Response) => createProject(req, res));

// POST /api/execution/files - Create a file in a project
router.post('/files', (req: Request, res: Response) => createFile(req, res));

// POST /api/execution/execute - Execute a project
router.post('/execute', (req: Request, res: Response) => executeProject(req, res));

// DELETE /api/execution/containers/:containerId - Stop execution
router.delete('/containers/:containerId', (req: Request, res: Response) => stopExecution(req, res));

// GET /api/execution/logs/:containerId - Get execution logs
router.get('/logs/:containerId', (req: Request, res: Response) => getExecutionLogs(req, res));

export default router;