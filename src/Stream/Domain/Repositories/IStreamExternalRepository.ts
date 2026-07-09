import { Stream } from "../Entities/Stream";

export interface IStreamExternalRepository {
    getLiveStreams(userIds: number[]): Promise<Stream[]>;
}
