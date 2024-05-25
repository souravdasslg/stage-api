import { WatchListMediaItem } from "../entities/watch-list.entity";
import { MongooseModel } from "@tsed/mongoose";
import { Inject } from "@tsed/di";
import { MediaType } from "../types";
import { NotFound } from "@tsed/exceptions";

export class WatchListRepository {
  @Inject(WatchListMediaItem)
  private watchListMediaItemEntity: MongooseModel<WatchListMediaItem>;

  async addMediaToWatchList({
    userId,
    movie,
    tvShow,
    mediaType
  }: {
    userId: string;
    movie?: string;
    tvShow?: string;
    mediaType: MediaType;
  }): Promise<WatchListMediaItem> {
    if (!movie && !tvShow) throw new Error("Movie or TV show ID is required");
    const watchListMediaItem =
      mediaType === MediaType.Movie
        ? await this.watchListMediaItemEntity.findOne({ userId, movie })
        : await this.watchListMediaItemEntity.findOne({ userId, tvShow });

    console.log("Inside repository", { movie, tvShow, mediaType, watchListMediaItem });

    if (watchListMediaItem) return watchListMediaItem;
    const newWatchListMediaItem = new this.watchListMediaItemEntity({ movie, tvShow, userId, mediaType });

    await newWatchListMediaItem.save();
    return newWatchListMediaItem;
  }

  async removeMediaFromWatchList({ userId, mediaId }: { userId: string; mediaId: string }) {
    const watchListMediaItem = await this.watchListMediaItemEntity.findOne({ userId, $or: [{ movie: mediaId }, { tvShow: mediaId }] });
    if (!watchListMediaItem) throw new NotFound("Media not found in watch list");

    return this.watchListMediaItemEntity.deleteOne({ _id: watchListMediaItem._id });
  }

  async getPaginatedWatchList(userId: string, { page, size, sort }: { page: number; size: number; sort: string | string[] }) {
    const skip = (page - 1) * size;
    const limit = size;

    const query = this.watchListMediaItemEntity
      .find({ userId })
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(limit)
      .populate("movie")
      .populate("tvShow")
      .lean();

    const [items, totalItems] = await Promise.all([query.exec(), this.watchListMediaItemEntity.countDocuments({ userId })]);

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page
    };
  }

  async getRecentlyAddedMedia(userId: string) {
    return this.watchListMediaItemEntity.find({ userId }).sort({ createdAt: "desc" }).limit(10).populate("movie").populate("tvShow").lean();
  }
}
