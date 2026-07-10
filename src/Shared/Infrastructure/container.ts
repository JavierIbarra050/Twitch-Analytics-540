import { config } from './Config/config';
import { TwitchHttpClient } from './Twitch/TwitchHttpClient';
import { AuthMiddleware } from './Middlewares/AuthMiddleware';

import { StreamerTwitchRepository } from '../../Streamer/Infrastructure/Repositories/StreamerTwitchRepository';
import { StreamerService } from '../../Streamer/Application/Services/StreamerService';
import { StreamerController } from '../../Streamer/Infrastructure/Controllers/StreamerController';

import { StreamTwitchRepository } from '../../Stream/Infrastructure/Repositories/StreamTwitchRepository';
import { StreamService } from '../../Stream/Application/Services/StreamService';
import { StreamController } from '../../Stream/Infrastructure/Controllers/StreamController';

import { TwitchClient as EnrichedTwitchClient } from '../../EnrichedStream/Infrastructure/Repositories/TwitchClient';
import { EnrichedStreamService } from '../../EnrichedStream/Application/Services/EnrichedStreamService';
import { EnrichedStreamController } from '../../EnrichedStream/Infrastructure/Controllers/EnrichedStreamController';

import { TwitchClient as TopOfTheTopsTwitchClient } from '../../TopOfTheTops/Infrastructure/Repositories/TwitchClient';
import { SQLiteGameCacheRepository } from '../../TopOfTheTops/Infrastructure/Repositories/SQLiteGameCacheRepository';
import { TopOfTheTopsService } from '../../TopOfTheTops/Application/Services/TopOfTheTopsService';
import { TopOfTheTopsController } from '../../TopOfTheTops/Infrastructure/Controllers/TopOfTheTopsController';

import { UserRepositorySQL } from '../../User/Infrastructure/Repositories/UserRepositorySQL';
import { UserService } from '../../User/Application/Services/UserService';
import { UserController } from '../../User/Infrastructure/Controllers/UserController';
import { UserTokenService } from '../../User/Application/Services/UserTokenService';
import { UserTokenController } from '../../User/Infrastructure/Controllers/UserTokenController';

export const userRepository = new UserRepositorySQL();
export const userService = new UserService(userRepository);
export const userController = new UserController(userService);
export const userTokenService = new UserTokenService(userRepository, config.tokenExpirationDays);
export const userTokenController = new UserTokenController(userTokenService);

export const twitchHttpClient = new TwitchHttpClient(config);
export const authMiddleware = new AuthMiddleware(userRepository);

export const streamerRepository = new StreamerTwitchRepository(twitchHttpClient);
export const streamerService = new StreamerService(streamerRepository);
export const streamerController = new StreamerController(streamerService);

export const streamRepository = new StreamTwitchRepository(twitchHttpClient);
export const streamService = new StreamService(streamRepository);
export const streamController = new StreamController(streamService);

export const enrichedStreamClient = new EnrichedTwitchClient(twitchHttpClient);
export const enrichedStreamService = new EnrichedStreamService(enrichedStreamClient);
export const enrichedStreamController = new EnrichedStreamController(enrichedStreamService);

export const topOfTheTopsTwitchClient = new TopOfTheTopsTwitchClient(twitchHttpClient);
export const gameCacheRepository = new SQLiteGameCacheRepository();
export const topOfTheTopsService = new TopOfTheTopsService(topOfTheTopsTwitchClient, gameCacheRepository);
export const topOfTheTopsController = new TopOfTheTopsController(topOfTheTopsService);
export const appConfig = config;
