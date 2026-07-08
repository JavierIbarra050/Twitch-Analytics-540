import { Router } from 'express';
import { TwitchRepository } from '../../repositories/TwitchRepository';
import { StreamerService } from '../../../application/services/StreamerService';
import { StreamerController } from '../controllers/StreamerController';

const router = Router();

const twitchRepository = new TwitchRepository();
const streamerService = new StreamerService(twitchRepository);
const streamerController = new StreamerController(streamerService);

router.get('/streamer', streamerController.getStreamerById);

export default router;
