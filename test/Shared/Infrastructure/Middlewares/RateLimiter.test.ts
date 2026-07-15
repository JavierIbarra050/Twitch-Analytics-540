import express from 'express';
import request from 'supertest';
import {
    createRateLimiter,
    extractBearerToken,
    authRoutesRateLimiter,
    analyticsRateLimiter,
    AUTH_ROUTES_RATE_LIMIT_WINDOW_MS,
    AUTH_ROUTES_RATE_LIMIT_MAX_REQUESTS,
    ANALYTICS_RATE_LIMIT_WINDOW_MS,
    ANALYTICS_RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_EXCEEDED_MESSAGE
} from '../../../../src/Shared/Infrastructure/Middlewares/RateLimiter';

const buildApp = (limiter: express.RequestHandler) => {
    const app = express();
    app.get('/ping', limiter, (_req, res) => {
        res.status(200).json({ ok: true });
    });
    return app;
};

describe('RateLimiter constants', () => {
    it('exposes the suggested defaults as named constants', () => {
        expect(AUTH_ROUTES_RATE_LIMIT_MAX_REQUESTS).toBe(20);
        expect(AUTH_ROUTES_RATE_LIMIT_WINDOW_MS).toBe(15 * 60 * 1000);
        expect(ANALYTICS_RATE_LIMIT_MAX_REQUESTS).toBe(100);
        expect(ANALYTICS_RATE_LIMIT_WINDOW_MS).toBe(60 * 1000);
    });
});

describe('extractBearerToken', () => {
    it('returns the token from a valid Bearer authorization header', () => {
        const req = { headers: { authorization: 'Bearer my-token' }, ip: '127.0.0.1' } as unknown as express.Request;

        expect(extractBearerToken(req)).toBe('my-token');
    });

    it('falls back to the request IP when there is no Bearer header', () => {
        const req = { headers: {}, ip: '10.0.0.5' } as unknown as express.Request;

        expect(extractBearerToken(req)).toBe('10.0.0.5');
    });
});

describe('createRateLimiter IP-based limiting', () => {
    const limit = 3;
    const app = buildApp(createRateLimiter({ windowMs: 60_000, limit, skip: () => false }));

    it('allows requests under the limit', async () => {
        for (let i = 0; i < limit; i++) {
            const res = await request(app).get('/ping');
            expect(res.status).toBe(200);
        }
    });

    it('returns 429 with a JSON error once the limit is exceeded', async () => {
        const res = await request(app).get('/ping');

        expect(res.status).toBe(429);
        expect(res.body).toEqual({ error: RATE_LIMIT_EXCEEDED_MESSAGE });
    });
});

describe('createRateLimiter token-based limiting', () => {
    const limit = 3;
    const app = buildApp(createRateLimiter({
        windowMs: 60_000,
        limit,
        keyGenerator: extractBearerToken,
        skip: () => false
    }));

    it('tracks each Bearer token independently', async () => {
        for (let i = 0; i < limit; i++) {
            const res = await request(app).get('/ping').set('Authorization', 'Bearer token-a');
            expect(res.status).toBe(200);
        }

        const exceededRes = await request(app).get('/ping').set('Authorization', 'Bearer token-a');
        expect(exceededRes.status).toBe(429);
        expect(exceededRes.body).toEqual({ error: RATE_LIMIT_EXCEEDED_MESSAGE });

        const otherTokenRes = await request(app).get('/ping').set('Authorization', 'Bearer token-b');
        expect(otherTokenRes.status).toBe(200);
    });
});

describe('production rate limiter instances under NODE_ENV=test', () => {
    it('does not rate-limit the auth routes limiter while running the test suite', async () => {
        const app = buildApp(authRoutesRateLimiter);

        for (let i = 0; i < AUTH_ROUTES_RATE_LIMIT_MAX_REQUESTS + 5; i++) {
            const res = await request(app).get('/ping');
            expect(res.status).toBe(200);
        }
    });

    it('does not rate-limit the analytics limiter while running the test suite', async () => {
        const app = buildApp(analyticsRateLimiter);

        for (let i = 0; i < ANALYTICS_RATE_LIMIT_MAX_REQUESTS + 5; i++) {
            const res = await request(app).get('/ping').set('Authorization', 'Bearer some-token');
            expect(res.status).toBe(200);
        }
    });
});
