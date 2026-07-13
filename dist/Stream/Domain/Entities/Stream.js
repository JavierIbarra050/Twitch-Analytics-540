"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stream = void 0;
class Stream {
    title;
    userName;
    constructor(title, userName) {
        this.title = title;
        this.userName = userName;
    }
    getTitle() {
        return this.title;
    }
    getUserName() {
        return this.userName;
    }
}
exports.Stream = Stream;
