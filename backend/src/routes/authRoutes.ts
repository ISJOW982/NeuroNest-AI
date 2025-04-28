import express, { Request, Response, NextFunction } from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  updateProfile, 
  changePassword, 
  forgotPassword, 
  logout 
} from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/register', (req: Request, res: Response) => register(req, res));
router.post('/login', (req: Request, res: Response) => login(req, res));
router.post('/forgot-password', (req: Request, res: Response) => forgotPassword(req, res));

// Protected routes (require authentication)
router.get('/me', (req: Request, res: Response, next: NextFunction) => authMiddleware(req, res, next), 
  (req: Request, res: Response) => getCurrentUser(req, res));
router.put('/profile', (req: Request, res: Response, next: NextFunction) => authMiddleware(req, res, next), 
  (req: Request, res: Response) => updateProfile(req, res));
router.put('/change-password', (req: Request, res: Response, next: NextFunction) => authMiddleware(req, res, next), 
  (req: Request, res: Response) => changePassword(req, res));
router.post('/logout', (req: Request, res: Response, next: NextFunction) => authMiddleware(req, res, next), 
  (req: Request, res: Response) => logout(req, res));

export default router;