import { Router } from 'express';
import { TwitchHttpClient } from '../../../Shared/Infrastructure/Twitch/TwitchHttpClient';

import { StreamerTwitchRepository } from '../Repositories/StreamerTwitchRepository';
import { StreamerService } from '../../Application/Services/StreamerService';
import { StreamerController } from '../Controllers/StreamerController';

import { StreamTwitchRepository } from '../../../Stream/Infrastructure/Repositories/StreamTwitchRepository';
import { StreamService } from '../../../Stream/Application/Services/StreamService';
import { StreamController } from '../../../Stream/Infrastructure/Controller/StreamController';

import { TwitchClient } from '../../../EnrichedStream/Infrastructure/Repositories/TwitchClient';
import { EnrichedStreamService } from '../../../EnrichedStream/Application/Services/EnrichedStreamService';
import { EnrichedStreamController } from '../../../EnrichedStream/Infrastructure/Controller/EnrichedStreamController';
import { AuthMiddleware } from '../../../Shared/Infrastructure/Middlewares/AuthMiddleware';

const router = Router();

const twitchHttpClient = new TwitchHttpClient();
const authMiddleware = new AuthMiddleware();

// Streamer
const streamerRepository = new StreamerTwitchRepository(twitchHttpClient);
const streamerService = new StreamerService(streamerRepository);
const streamerController = new StreamerController(streamerService);

// Stream
const streamRepository = new StreamTwitchRepository(twitchHttpClient);
const streamService = new StreamService(streamRepository);
const streamController = new StreamController(streamService);

// EnrichedStream
const enrichedStreamClient = new TwitchClient(twitchHttpClient);
const enrichedStreamService = new EnrichedStreamService(enrichedStreamClient);
const enrichedStreamController = new EnrichedStreamController(enrichedStreamService);

router.get('/streamer', streamerController.getStreamerById);
router.get('/streams', streamController.getLiveStreams);
router.get('/streams/enriched', authMiddleware.execute.bind(authMiddleware), enrichedStreamController.getTopEnrichedStreams.bind(enrichedStreamController));

export default router;



