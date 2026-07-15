import { config } from './Config/config';
import { TwitchHttpClient } from './Twitch/TwitchHttpClient';
import { TwitchUsersClient } from './Twitch/TwitchUsersClient';
import { AuthMiddleware } from './Middlewares/AuthMiddleware';

import { StreamerTwitchRepository } from '../../Streamer/Infrastructure/Repositories/StreamerTwitchRepository';
import { StreamerService } from '../../Streamer/Application/Services/StreamerService';
import { StreamerController } from '../../Streamer/Infrastructure/Controllers/StreamerController';

import { StreamTwitchRepository } from '../../Stream/Infrastructure/Repositories/StreamTwitchRepository';
import { StreamService } from '../../Stream/Application/Services/StreamService';
import { StreamController } from '../../Stream/Infrastructure/Controllers/StreamController';
import { EnrichedStreamController } from '../../Stream/Infrastructure/Controllers/EnrichedStreamController';

import { TwitchClient as TopOfTheTopsTwitchClient } from '../../TopOfTheTops/Infrastructure/Repositories/TwitchClient';
import { GameCacheRepository } from '../../TopOfTheTops/Infrastructure/Repositories/GameCacheRepository';
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
export const twitchUsersClient = new TwitchUsersClient(twitchHttpClient);
export const authMiddleware = new AuthMiddleware(userRepository);

export const streamerRepository = new StreamerTwitchRepository(twitchUsersClient);
export const streamerService = new StreamerService(streamerRepository);
export const streamerController = new StreamerController(streamerService);

export const streamRepository = new StreamTwitchRepository(twitchHttpClient, twitchUsersClient);
export const streamService = new StreamService(streamRepository);
export const streamController = new StreamController(streamService);
export const enrichedStreamController = new EnrichedStreamController(streamService);

export const topOfTheTopsTwitchClient = new TopOfTheTopsTwitchClient(twitchHttpClient);
export const gameCacheRepository = new GameCacheRepository();
export const topOfTheTopsService = new TopOfTheTopsService(topOfTheTopsTwitchClient, gameCacheRepository);
export const topOfTheTopsController = new TopOfTheTopsController(topOfTheTopsService);
export const appConfig = config;
