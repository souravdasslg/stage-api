import { BodyParams, Context, Controller, Delete, Get, Inject, Post, QueryParams } from "@tsed/common";
import { WatchListService } from "../../../services/watchList.service";
import { Auth } from "../../../middlewares/auth-middleware";
import { AddToWatchListPayload } from "./watch-list.model";
import { Returns } from "@tsed/schema";
import { Pagination } from "../../../paginations/Pagination";
import { WatchListMediaItem } from "../../../entities/watch-list.entity";
import { Pageable } from "../../../paginations/Pageable";
import { UseCache } from "@tsed/platform-cache";

@Controller("/watch-list")
@Auth()
export class WatchListController {
  @Inject(WatchListService)
  private watchListService: WatchListService;

  @Get("/")
  async getWatchList(@Context() ctx: Context) {
    return this.watchListService.getRecentlyAddedMedia(ctx.user.id);
  }

  @Get("/paginated")
  @Returns(206, Pagination).Of(WatchListMediaItem).Title("Watch List")
  async getPaginatedWatchList(@QueryParams() pageableOptions: Pageable, @Context() ctx: Context) {
    return this.watchListService.getPaginatedWatchList(ctx.user.id, pageableOptions);
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
    const response = await this.watchListService.removeMediaFromWatchList({
      userId: ctx.user.id,
      mediaId
    });
    return {
      message: "Media removed from watch list"
    };
  }
}
