process.env.TWITCH_CLIENT_ID = 'test-client-id';
process.env.TWITCH_CLIENT_SECRET = 'test-client-secret';

import request from 'supertest';
import { app } from '../src/app';

describe('app', () => {
    it('should return 404 with a JSON error for unknown routes', async () => {
        const res = await request(app).get('/this-route-does-not-exist');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Not Found.' });
    });

    it('should return 500 with a JSON error for malformed JSON bodies', async () => {
        const res = await request(app)
            .post('/register')
            .set('Content-Type', 'application/json')
            .send('{invalid-json');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Internal server error.' });
    });
});
