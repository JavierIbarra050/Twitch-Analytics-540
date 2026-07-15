import path from 'path';
import fs from 'fs';

const testDbPath = path.resolve(__dirname, '../../database_test.sqlite');
process.env.DATABASE_PATH = testDbPath;
process.env.TWITCH_CLIENT_ID = 'test-client-id';
process.env.TWITCH_CLIENT_SECRET = 'test-client-secret';
process.env.DB_HOST = '';
process.env.DB_PORT = '';
process.env.DB_USER = '';
process.env.DB_PASSWORD = '';
process.env.DB_NAME = '';

import request from 'supertest';
import axios from 'axios';
import { app } from '../../src/app';
import { initializeDatabase, closeDatabase, getDatabase } from '../../src/Shared/Infrastructure/Database/database';

jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe('End-to-End Analytics API Flow', () => {
    beforeAll(async () => {
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
        await initializeDatabase();
        const db = await getDatabase();
        expect(db.type).toBe('sqlite');
    });

    afterAll(async () => {
        await closeDatabase();
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockedAxios.post.mockResolvedValue({
            data: {
                access_token: 'mock-access-token',
                expires_in: 3600,
                token_type: 'bearer'
            }
        });
    });

    it('should run registration, token generation, and execute all analytics endpoints successfully', async () => {
        const email = 'user@example.com';

        const registerRes = await request(app)
            .post('/register')
            .send({ email });

        expect(registerRes.status).toBe(200);
        expect(registerRes.body).toHaveProperty('api_key');
        const apiKey = registerRes.body.api_key;

        const tokenRes = await request(app)
            .post('/token')
            .send({ email, api_key: apiKey });

        expect(tokenRes.status).toBe(200);
        expect(tokenRes.body).toHaveProperty('token');
        const token = tokenRes.body.token;

        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: [
                    {
                        id: '83232866',
                        login: 'ibai',
                        display_name: 'Ibai',
                        type: '',
                        broadcaster_type: 'partner',
                        description: 'Channel desc',
                        profile_image_url: 'http://image.png',
                        offline_image_url: 'http://offline.png',
                        view_count: 99999,
                        created_at: '2020-01-01T00:00:00Z'
                    }
                ]
            }
        });

        const streamerRes = await request(app)
            .get('/analytics/streamer?id=83232866')
            .set('Authorization', `Bearer ${token}`);

        expect(streamerRes.status).toBe(200);
        expect(streamerRes.body).toEqual({
            id: '83232866',
            login: 'ibai',
            display_name: 'Ibai',
            type: '',
            broadcaster_type: 'partner',
            description: 'Channel desc',
            profile_image_url: 'http://image.png',
            offline_image_url: 'http://offline.png',
            view_count: 99999,
            created_at: '2020-01-01T00:00:00.000Z'
        });

        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: [
                    {
                        id: '1',
                        user_id: '123',
                        user_name: 'Streamer 1',
                        game_id: 'game1',
                        game_name: 'Game One',
                        type: 'live',
                        title: 'Title 1',
                        viewer_count: 500,
                        started_at: '2026-07-09T00:00:00Z',
                        language: 'es',
                        thumbnail_url: 'url',
                        tag_ids: [],
                        is_mature: false
                    }
                ]
            }
        });

        const streamsRes = await request(app)
            .get('/analytics/streams')
            .set('Authorization', `Bearer ${token}`);

        expect(streamsRes.status).toBe(200);
        expect(streamsRes.body).toHaveLength(1);
        expect(streamsRes.body[0]).toHaveProperty('title', 'Title 1');

        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: [
                    {
                        id: '1',
                        user_id: '123',
                        user_name: 'Streamer 1',
                        game_id: 'game1',
                        game_name: 'Game One',
                        type: 'live',
                        title: 'Title 1',
                        viewer_count: 500,
                        started_at: '2026-07-09T00:00:00Z',
                        language: 'es',
                        thumbnail_url: 'url',
                        tag_ids: [],
                        is_mature: false
                    }
                ]
            }
        });

        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: [
                    {
                        id: '123',
                        login: 'streamer1',
                        display_name: 'Streamer 1 Display',
                        type: '',
                        broadcaster_type: 'partner',
                        description: 'desc',
                        profile_image_url: 'url_profile',
                        offline_image_url: '',
                        view_count: 100,
                        created_at: '2020-01-01T00:00:00Z'
                    }
                ]
            }
        });

        const enrichedRes = await request(app)
            .get('/analytics/streams/enriched?limit=1')
            .set('Authorization', `Bearer ${token}`);

        expect(enrichedRes.status).toBe(200);
        expect(enrichedRes.body).toHaveLength(1);
        expect(enrichedRes.body[0]).toEqual({
            stream_id: '1',
            user_id: '123',
            user_name: 'Streamer 1',
            viewer_count: 500,
            title: 'Title 1',
            user_display_name: 'Streamer 1 Display',
            profile_image_url: 'url_profile'
        });

        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: [
                    { id: '1', name: 'Game 1' }
                ]
            }
        });

        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: [
                    { id: 'v1', user_id: '456', user_name: 'User 1', title: 'Top Video', view_count: 1000, duration: '10m', created_at: '2026-07-09T00:00:00Z' }
                ]
            }
        });

        const topRes = await request(app)
            .get('/analytics/topsofthetops')
            .set('Authorization', `Bearer ${token}`);

        expect(topRes.status).toBe(200);
        expect(topRes.body).toHaveLength(1);
        expect(topRes.body[0].game_name).toBe('Game 1');
        expect(topRes.body[0].user_name).toBe('User 1');
    });

    it('should return 401 when calling protected endpoint without token', async () => {
        const res = await request(app)
            .get('/analytics/streams');

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ error: 'Unauthorized. Token is invalid or expired.' });
    });
});
