import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services';
import { reviewRequestSchema } from '../schemas';
import type { AuthenticatedRequest } from '../types/user.types';

export class ReviewController {
  async reviewPullRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = reviewRequestSchema.parse(req.body);
      const authReq = req as AuthenticatedRequest;

      const userToken = authReq.user?.accessToken;

      const review = await reviewService.reviewPullRequest(validatedData.prUrl, userToken);

      res.status(200).json(review);
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
