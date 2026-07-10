import { Router } from 'express';
import {
    authMiddleware,
    streamerController,
    streamController,
    enrichedStreamController,
    topOfTheTopsController
} from '../../../Shared/Infrastructure/container';

const router = Router();

router.get('/streamer', authMiddleware.execute, streamerController.getStreamerById);
router.get('/streams', authMiddleware.execute, streamController.getLiveStreams);
router.get('/streams/enriched', authMiddleware.execute.bind(authMiddleware), enrichedStreamController.getTopEnrichedStreams.bind(enrichedStreamController));
router.get('/topsofthetops', authMiddleware.execute.bind(authMiddleware), topOfTheTopsController.getTopOfTheTops.bind(topOfTheTopsController));

export default router;
