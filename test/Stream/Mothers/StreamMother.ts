import { Stream } from "Stream/Domain/Entities/Stream";

export class StreamMother {
    static create(overrides?: { title?: string; userName?: string }): Stream {
        return new Stream(
            overrides?.title ?? "Charlando de la vida",
            overrides?.userName ?? "Ibai"
        );
    }
}
