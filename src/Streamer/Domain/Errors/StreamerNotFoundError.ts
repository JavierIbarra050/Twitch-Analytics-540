export class StreamerNotFoundError extends Error {
    constructor(id: number) {
        super(`Streamer with id: ${id} not found`);
        this.name = 'StreamerNotFoundError';
    }
}
