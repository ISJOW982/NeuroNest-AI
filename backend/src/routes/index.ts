import { Router } from 'express';
import agentRoutes from './agentRoutes';
import executionRoutes from './executionRoutes';

const router = Router();

// Mount routes
router.use('/agents', agentRoutes);
router.use('/execution', executionRoutes);

export default router;