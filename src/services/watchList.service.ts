import { Pageable } from "@/paginations/Pageable";
import { MovieRepository } from "@/repositories/movies.repository";
import { TVShowRepository } from "@/repositories/tv-show.repository";
import { WatchListRepository } from "@/repositories/watchlist.repository";
import { MediaType } from "@/types";

import { Inject, Injectable } from "@tsed/di";
import { NotFound } from "@tsed/exceptions";
import { PlatformCache, UseCache } from "@tsed/platform-cache";

const getRecentlyAddedMediaCacheKey = (userId: string) => `stage:WatchListService:getRecentlyAddedMedia:${userId}`;

@Injectable()
export class WatchListService {
  @Inject()
  private watchListRepository: WatchListRepository;
  @Inject()
  private movieRepository: MovieRepository;
  @Inject()
  private tvShowRepository: TVShowRepository;
  @Inject()
  protected cache: PlatformCache;

  async addMediaToWatchList({ userId, mediaId }: { userId: string; mediaId: string }) {
    // find media details.
    const [movie, tvShow] = await Promise.all([this.movieRepository.findById(mediaId), this.tvShowRepository.findById(mediaId)]);

    const media = movie || tvShow;
    if (!media) throw new NotFound("Media not found");

    const mediaType = movie ? MediaType.Movie : MediaType.TVShow;

    const response = await this.watchListRepository.addMediaToWatchList({
      userId,
      ...(mediaType === MediaType.Movie && media ? { movie: media._id } : {}),
      ...(mediaType === MediaType.TVShow && media ? { tvShow: media._id } : {}),
      mediaType
    });

    // Refresh recently added media cache
    await this.cache.del(getRecentlyAddedMediaCacheKey(userId));
    return response;
  }

  async removeMediaFromWatchList({ watchListItemId }: { watchListItemId: string }) {
    return this.watchListRepository.removeMediaFromWatchList({ watchListItemId });
  }

  async getPaginatedWatchList(userId: string, { page, size }: Pageable) {
    const response = await this.watchListRepository.getPaginatedWatchList(userId, { page, size });
    return {
      data: response.items,
      totalCount: response.totalItems,
      page: page,
      totalPages: Math.ceil(response.totalItems / size)
    };
  }

  @UseCache({
    canCache: "no-nullish"
  })
  async getRecentlyAddedMedia(userId: string) {
    return this.watchListRepository.getRecentlyAddedMedia(userId);
  }
}
