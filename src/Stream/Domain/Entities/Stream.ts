export class Stream {
    constructor (
        private readonly title: string,
        private readonly userName: string,
    ) { }

    getTitle(): string {
        return this.title;
    }

    getUserName(): string {
        return this.userName;
    }
}
