import Redis from "ioredis";
import { env } from "process";

import { Configuration, registerProvider } from "@tsed/di";
import { Logger } from "@tsed/logger";

export const REDIS_CONNECTION = Symbol("redis:connection");
export type REDIS_CONNECTION = Redis;

registerProvider({
  provide: REDIS_CONNECTION,
  deps: [Configuration, Logger],
  async useAsyncFactory(configuration: Configuration, logger: Logger) {
    if (env.NODE_ENV === "test") {
      return null;
    }
    const cacheSettings = configuration.get("cache");
    const redisSettings = configuration.get("redis");
    const connection = new Redis({ ...redisSettings, lazyConnect: true });

    cacheSettings.redisInstance = connection;

    try {
      await connection.connect();
      logger.info("Connected to redis database...");
    } catch (error) {
      logger.error({
        event: "REDIS_ERROR",
        error
      });
    }

    return connection;
  },
  hooks: {
    $onDestroy(connection: Redis) {
      return connection && connection.disconnect ? connection.disconnect() : null;
    }
  }
});
