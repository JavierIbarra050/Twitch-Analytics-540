import { Router } from 'express';
import { TwitchHttpClient } from '../../../Shared/Infrastructure/Twitch/TwitchHttpClient';

import { StreamerTwitchRepository } from '../Repositories/StreamerTwitchRepository';
import { StreamerService } from '../../Application/Services/StreamerService';
import { StreamerController } from '../Controllers/StreamerController';

import { StreamTwitchRepository } from '../../../Stream/Infrastructure/Repositories/StreamTwitchRepository';
import { StreamService } from '../../../Stream/Application/Services/StreamService';
import { StreamController } from '../../../Stream/Infrastructure/Controller/StreamController';

const router = Router();

const twitchHttpClient = new TwitchHttpClient();

// Streamer
const streamerRepository = new StreamerTwitchRepository(twitchHttpClient);
const streamerService = new StreamerService(streamerRepository);
const streamerController = new StreamerController(streamerService);

// Stream
const streamRepository = new StreamTwitchRepository(twitchHttpClient);
const streamService = new StreamService(streamRepository);
const streamController = new StreamController(streamService);

router.get('/streamer', streamerController.getStreamerById);
router.get('/streams', streamController.getLiveStreams);

export default router;


