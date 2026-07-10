import { Router } from 'express';
import { TwitchHttpClient } from '../../../Shared/Infrastructure/Twitch/TwitchHttpClient';

import { StreamerTwitchRepository } from '../Repositories/StreamerTwitchRepository';
import { StreamerService } from '../../Application/Services/StreamerService';
import { StreamerController } from '../Controllers/StreamerController';

import { StreamTwitchRepository } from '../../../Stream/Infrastructure/Repositories/StreamTwitchRepository';
import { StreamService } from '../../../Stream/Application/Services/StreamService';
import { StreamController } from '../../../Stream/Infrastructure/Controllers/StreamController';

import { TwitchClient } from '../../../EnrichedStream/Infrastructure/Repositories/TwitchClient';
import { EnrichedStreamService } from '../../../EnrichedStream/Application/Services/EnrichedStreamService';
import { EnrichedStreamController } from '../../../EnrichedStream/Infrastructure/Controllers/EnrichedStreamController';
import { AuthMiddleware } from '../../../Shared/Infrastructure/Middlewares/AuthMiddleware';

import { SQLiteGameCacheRepository } from '../../../TopOfTheTops/Infrastructure/Repositories/SQLiteGameCacheRepository';
import { TwitchClient as TopOfTheTopsTwitchClient } from '../../../TopOfTheTops/Infrastructure/Repositories/TwitchClient';
import { TopOfTheTopsService } from '../../../TopOfTheTops/Application/Services/TopOfTheTopsService';
import { TopOfTheTopsController } from '../../../TopOfTheTops/Infrastructure/Controllers/TopOfTheTopsController';

const router = Router();

const twitchHttpClient = new TwitchHttpClient();
const authMiddleware = new AuthMiddleware();

const streamerRepository = new StreamerTwitchRepository(twitchHttpClient);
const streamerService = new StreamerService(streamerRepository);
const streamerController = new StreamerController(streamerService);

const streamRepository = new StreamTwitchRepository(twitchHttpClient);
const streamService = new StreamService(streamRepository);
const streamController = new StreamController(streamService);

const enrichedStreamClient = new TwitchClient(twitchHttpClient);
const enrichedStreamService = new EnrichedStreamService(enrichedStreamClient);
const enrichedStreamController = new EnrichedStreamController(enrichedStreamService);

const topOfTheTopsTwitchClient = new TopOfTheTopsTwitchClient(twitchHttpClient);
const gameCacheRepository = new SQLiteGameCacheRepository();
const topOfTheTopsService = new TopOfTheTopsService(topOfTheTopsTwitchClient, gameCacheRepository);
const topOfTheTopsController = new TopOfTheTopsController(topOfTheTopsService);

router.get('/streamer', authMiddleware.execute, streamerController.getStreamerById);
router.get('/streams', authMiddleware.execute, streamController.getLiveStreams);
router.get('/streams/enriched', authMiddleware.execute.bind(authMiddleware), enrichedStreamController.getTopEnrichedStreams.bind(enrichedStreamController));
router.get('/topsofthetops', authMiddleware.execute.bind(authMiddleware), topOfTheTopsController.getTopOfTheTops.bind(topOfTheTopsController));

export default router;
