import { BodyParams, Context, Controller, Delete, Get, Inject, Post, QueryParams, UseBefore } from "@tsed/common";
import { WatchListService } from "../../../services/watchList.service";
import { Auth } from "../../../middlewares/auth-middleware";
import { AddToWatchListPayload } from "./watch-list.model";
import { Returns } from "@tsed/schema";
import { Pagination } from "../../../paginations/Pagination";
import { WatchListMediaItem } from "../../../entities/watch-list.entity";
import { Pageable } from "../../../paginations/Pageable";

@Controller("/watch-list")
@Auth()
export class WatchListController {
  @Inject(WatchListService)
  private watchListService: WatchListService;

  @Get("/")
  async getWatchList(@Context() ctx: Context) {
    return this.watchListService.getFullWatchList(ctx.user.id, {
      page: 1,
      size: 10,
      sort: "asc",
      offset: 0,
      limit: 10
    });
  }

  @Get("/full")
  @Returns(206, Pagination).Of(WatchListMediaItem).Title("Watch List")
  async getFullWatchList(@QueryParams() pageableOptions: Pageable, @Context() ctx: Context) {
    return this.watchListService.getFullWatchList(ctx.user.id, pageableOptions);
  }

  @Post("/")
  async addToWatchList(@BodyParams() input: AddToWatchListPayload, @Context() ctx: Context) {
    await this.watchListService.addMediaToWatchList({
      userId: ctx.user.id,
      mediaId: input.mediaId
    });
    return { message: "Media added to watch list" };
  }

  @Delete("/")
  async removeFromWatchList() {}
}
