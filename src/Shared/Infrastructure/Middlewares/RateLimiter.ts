import { Request, Response } from 'express';
import rateLimit, { ipKeyGenerator, Options } from 'express-rate-limit';

export const AUTH_ROUTES_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const AUTH_ROUTES_RATE_LIMIT_MAX_REQUESTS = 20;

export const ANALYTICS_RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const ANALYTICS_RATE_LIMIT_MAX_REQUESTS = 100;

export const RATE_LIMIT_EXCEEDED_MESSAGE = 'Too many requests. Please try again later.';

type RateLimiterConfig = Pick<Options, 'windowMs' | 'limit'> & Partial<Pick<Options, 'keyGenerator' | 'skip'>>;

const isTestEnvironment = (): boolean => process.env.NODE_ENV === 'test';

export const createRateLimiter = (config: RateLimiterConfig) => rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    skip: config.skip ?? (() => isTestEnvironment()),
    handler: (_req: Request, res: Response) => {
        res.status(429).json({ error: RATE_LIMIT_EXCEEDED_MESSAGE });
    },
    windowMs: config.windowMs,
    limit: config.limit,
    keyGenerator: config.keyGenerator
});

export const extractBearerToken = (req: Request): string => {
    const authHeader = req.headers.authorization;

    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }

    return ipKeyGenerator(req.ip ?? 'unknown');
};

export const authRoutesRateLimiter = createRateLimiter({
    windowMs: AUTH_ROUTES_RATE_LIMIT_WINDOW_MS,
    limit: AUTH_ROUTES_RATE_LIMIT_MAX_REQUESTS
});

export const analyticsRateLimiter = createRateLimiter({
    windowMs: ANALYTICS_RATE_LIMIT_WINDOW_MS,
    limit: ANALYTICS_RATE_LIMIT_MAX_REQUESTS,
    keyGenerator: extractBearerToken
});
