import { TopOfTheTops } from "../Entities/TopOfTheTops";

export interface IGameCacheRepository {
    getCachedStats(): Promise<TopOfTheTops[] | null>;

    saveCachedStats(stats: TopOfTheTops[]): Promise<void>;

    getCacheAgeInMinutes(): Promise<number | null>;
}
