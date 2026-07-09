import { Stream } from "../Entities/Stream";

export interface IStreamExternalRepository {
    getLiveStreams(): Promise<Stream[]>;
}
