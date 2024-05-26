import { BodyParams, Context, Controller, Delete, Get, Inject, Post, QueryParams } from "@tsed/common";
import { Returns } from "@tsed/schema";

import { WatchListMediaItem } from "../../../entities/watch-list.entity";
import { Auth } from "../../../middlewares/auth.middleware";
import { Pageable } from "../../../paginations/Pageable";
import { Pagination } from "../../../paginations/Pagination";
import { WatchListService } from "../../../services/watchList.service";
import { AddToWatchListPayload } from "./watch-list.schema";

@Controller("/watch-list")
@Auth()
export class WatchListController {
  @Inject(WatchListService)
  private watchListService: WatchListService;

  @Get("/")
  async getWatchList(@Context() ctx: Context) {
    const response = await this.watchListService.getRecentlyAddedMedia(ctx.user.id);
    return {
      data: response
    };
  }

  @Get("/paginated")
  @Returns(206, Pagination).Of(WatchListMediaItem).Title("Watch List")
  async getPaginatedWatchList(@QueryParams() pageableOptions: Pageable, @Context() ctx: Context) {
    const response = await this.watchListService.getPaginatedWatchList(ctx.user.id, pageableOptions);
    return {
      data: response
    };
  }

  @Post("/")
  async addToWatchList(@BodyParams() input: AddToWatchListPayload, @Context() ctx: Context) {
    const response = await this.watchListService.addMediaToWatchList({
      userId: ctx.user.id,
      mediaId: input.mediaId
    });
    return {
      message: "Media added to watch list",
      data: response
    };
  }

  @Delete("/")
  async removeFromWatchList(@BodyParams() mediaId: string, @Context() ctx: Context) {
    await this.watchListService.removeMediaFromWatchList({
      userId: ctx.user.id,
      mediaId
    });
    return {
      message: "Media removed from watch list"
    };
  }
}
