export class Streamer {
    constructor (
        private readonly id: number,
        private readonly displayName: string,
        private readonly type: string,
        private readonly breadcasterType: string,
        private readonly description: string,
        private readonly profileImageUrl: string,
        private readonly offlineImageUrl: string,
        private readonly viewCount: number,
        private readonly createdAt: Date,
    ) { }

    
}