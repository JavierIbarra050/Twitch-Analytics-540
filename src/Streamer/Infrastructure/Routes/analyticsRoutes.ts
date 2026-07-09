import { Router } from 'express';
import { TwitchHttpClient } from '../../../Shared/Infrastructure/Twitch/TwitchHttpClient';
import { StreamerTwitchRepository } from '../Repositories/StreamerTwitchRepository';
import { StreamerService } from '../../Application/Services/StreamerService';
import { StreamerController } from '../Controllers/StreamerController';

const router = Router();

const twitchHttpClient = new TwitchHttpClient();
const streamerRepository = new StreamerTwitchRepository(twitchHttpClient);
const streamerService = new StreamerService(streamerRepository);
const streamerController = new StreamerController(streamerService);

router.get('/streamer', streamerController.getStreamerById);

export default router;

