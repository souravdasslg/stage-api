import { WatchListMediaItem } from "@/entities/watch-list.entity";
import { MediaType } from "@/types";

import { Inject } from "@tsed/di";
import { NotFound } from "@tsed/exceptions";
import { MongooseModel } from "@tsed/mongoose";

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

    if (watchListMediaItem) return watchListMediaItem;
    const newWatchListMediaItem = new this.watchListMediaItemEntity({ movie, tvShow, userId, mediaType });

    await newWatchListMediaItem.save();
    return newWatchListMediaItem;
  }

  async removeMediaFromWatchList({ watchListItemId }: { watchListItemId: string }) {
    const watchListMediaItem = await this.watchListMediaItemEntity.findOne({ _id: watchListItemId });
    if (!watchListMediaItem) throw new NotFound("Invalid watch list item ID");

    return this.watchListMediaItemEntity.deleteOne({ _id: watchListMediaItem._id });
  }

  async getPaginatedWatchList(userId: string, { page, size }: { page: number; size: number }) {
    const currentPage = Math.max(page, 1); // Ensure page is at least 1
    const skip = (currentPage - 1) * size;
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
      currentPage
    };
  }

  async getRecentlyAddedMedia(userId: string) {
    const recentlyAddedMedia = await this.watchListMediaItemEntity
      .find({ userId })
      .sort({ createdAt: "desc" })
      .limit(10)
      .populate("movie")
      .populate("tvShow")
      .lean();

    return recentlyAddedMedia;
  }
}
