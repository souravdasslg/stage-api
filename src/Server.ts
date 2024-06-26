import { config } from "@/config/index";
import * as pages from "@/controllers/pages/index";
import * as rest from "@/controllers/rest/index";
import "@/datasource";
import redisStore from "cache-manager-ioredis";
import { join } from "path";

// /!\ keep this import
import "@tsed/ajv";
import { PlatformApplication } from "@tsed/common";
import { Configuration, Inject } from "@tsed/di";
import "@tsed/platform-express";
import "@tsed/swagger";

@Configuration({
  ...config,
  cache: {
    ttl: 60 * 60 * 24 * 1000, // 1 Day
    store: redisStore,
    prefix: "stage" // to namespace all keys related to the cache
  },
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8083,
  httpsPort: false, // CHANGE
  disableComponentsScan: true,
  ajv: {
    returnsCoercedValues: true
  },
  mount: {
    "/api": [...Object.values(rest)],
    "/": [...Object.values(pages)]
  },
  swagger: [
    {
      path: "/doc",
      specVersion: "3.0.1"
    }
  ],
  middlewares: [
    "cors",
    "cookie-parser",
    "compression",
    "method-override",
    "json-parser",
    { use: "urlencoded-parser", options: { extended: true } }
  ],
  views: {
    root: join(process.cwd(), "../views"),
    extensions: {
      ejs: "ejs"
    }
  },
  exclude: ["**/*.spec.ts"]
})
export class Server {
  @Inject()
  protected app: PlatformApplication;

  @Configuration()
  protected settings: Configuration;
}
