import { Router } from 'express';
import {
    authMiddleware,
    streamerController,
    streamController,
    enrichedStreamController,
    topOfTheTopsController
} from '../container';
import { analyticsRateLimiter } from '../Middlewares/RateLimiter';

const router = Router();

router.get('/streamer', authMiddleware.execute, analyticsRateLimiter, streamerController.getStreamerById);
router.get('/streams', authMiddleware.execute, analyticsRateLimiter, streamController.getLiveStreams);
router.get('/streams/enriched', authMiddleware.execute, analyticsRateLimiter, enrichedStreamController.getTopEnrichedStreams);
router.get('/topsofthetops', authMiddleware.execute, analyticsRateLimiter, topOfTheTopsController.getTopOfTheTops);

export default router;
