import { Game } from '../../../../src/TopOfTheTops/Domain/Entities/Game';

describe('Game entity', () => {
    it('getId should return the id passed in constructor', () => {
        const game = new Game('509658', 'Just Chatting');

        expect(game.getId()).toBe('509658');
    });

    it('getName should return the name passed in constructor', () => {
        const game = new Game('509658', 'Just Chatting');

        expect(game.getName()).toBe('Just Chatting');
    });
});
