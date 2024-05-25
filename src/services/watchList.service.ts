import { Inject, Injectable } from "@tsed/di";
import { WatchListRepository } from "../repositories/watchlist.repository";
import { MovieRepository } from "../repositories/movies.repository";
import { TVShowRepository } from "../repositories/tv-show.repository";
import { NotFound } from "@tsed/exceptions";
import { Pageable } from "../paginations/Pageable";
import { PlatformCache, UseCache } from "@tsed/platform-cache";
import { MediaType } from "../types";

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

    console.log(movie, tvShow);

    const media = movie || tvShow;
    if (!media) throw new NotFound("Media not found");

    const mediaType = movie ? MediaType.Movie : MediaType.TVShow;

    const response = await this.watchListRepository.addMediaToWatchList({
      userId,
      ...(mediaType === "Movie" && media ? { movie: media._id } : {}),
      ...(mediaType === "TVShow" && media ? { tvShow: media._id } : {}),
      mediaType
    });

    // Refresh recently added media cache
    this.cache.refresh(() => this.getRecentlyAddedMedia(userId));
    return response;
  }

  async removeMediaFromWatchList({ userId, mediaId }: { userId: string; mediaId: string }) {
    return this.watchListRepository.removeMediaFromWatchList({ userId, mediaId });
  }

  async getPaginatedWatchList(userId: string, { page, size, sort }: Pageable) {
    return this.watchListRepository.getPaginatedWatchList(userId, { page, size, sort });
  }

  @UseCache({ canCache: "no-nullish" })
  async getRecentlyAddedMedia(userId: string) {
    return this.watchListRepository.getRecentlyAddedMedia(userId);
  }
}
