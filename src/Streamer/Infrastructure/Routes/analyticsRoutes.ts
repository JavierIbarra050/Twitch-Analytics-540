import { Router } from 'express';
import { TwitchRepository } from '../Repositories/TwitchRepository';
import { StreamerService } from '../../Application/Services/StreamerService';
import { StreamerController } from '../Controllers/StreamerController';

const router = Router();

const twitchRepository = new TwitchRepository();
const streamerService = new StreamerService(twitchRepository);
const streamerController = new StreamerController(streamerService);

router.get('/streamer', streamerController.getStreamerById);

export default router;
