import { Router } from 'express';
import { reviewController } from '../controllers';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/review', optionalAuth, (req, res, next) => {
  void reviewController.reviewPullRequest(req, res, next);
});

export default router;
