import { Video } from '../../../../src/TopOfTheTops/Domain/Entities/Video';

describe('Video entity', () => {
    const video = new Video(
        'v1',
        'u1',
        'User 1',
        'Title 1',
        100,
        '10m',
        '2026-07-09T00:00:00Z'
    );

    it('getId should return the id passed in constructor', () => {
        expect(video.getId()).toBe('v1');
    });

    it('getUserId should return the userId passed in constructor', () => {
        expect(video.getUserId()).toBe('u1');
    });

    it('getUserName should return the userName passed in constructor', () => {
        expect(video.getUserName()).toBe('User 1');
    });

    it('getTitle should return the title passed in constructor', () => {
        expect(video.getTitle()).toBe('Title 1');
    });

    it('getViewCount should return the viewCount passed in constructor', () => {
        expect(video.getViewCount()).toBe(100);
    });

    it('getDuration should return the duration passed in constructor', () => {
        expect(video.getDuration()).toBe('10m');
    });

    it('getCreatedAt should return the createdAt passed in constructor', () => {
        expect(video.getCreatedAt()).toBe('2026-07-09T00:00:00Z');
    });
});
