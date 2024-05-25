import { Inject, Injectable } from "@tsed/di";
import { WatchListRepository } from "../repositories/watchlist.repository";
import { MovieRepository } from "../repositories/movies.repository";
import { TVShowRepository } from "../repositories/tv-show.repository";
import { NotFound } from "@tsed/exceptions";
import { Pageable } from "../paginations/Pageable";

@Injectable()
export class WatchListService {
  @Inject()
  private watchListRepository: WatchListRepository;
  @Inject()
  private movieRepository: MovieRepository;
  @Inject()
  private tvShowRepository: TVShowRepository;

  async addMediaToWatchList({ userId, mediaId }: { userId: string; mediaId: string }) {
    // find media details.
    const [movie, tvShow] = await Promise.all([this.movieRepository.findById(mediaId), this.tvShowRepository.findById(mediaId)]);

    const media = movie || tvShow;
    if (!media) throw new NotFound("Media not found");

    const mediaType = movie ? "Movie" : "TVShow";

    return this.watchListRepository.addMediaToWatchList({
      userId,
      ...(mediaType === "Movie" && media ? { movie: media._id } : {}),
      ...(mediaType === "TVShow" && media ? { tvShow: media._id } : {}),
      mediaType
    });
  }

  async removeMediaFromWatchList({ userId, mediaId }: { userId: string; mediaId: string }) {
    return this.watchListRepository.removeMediaFromWatchList({ userId, mediaId });
  }

  async getFullWatchList(userId: string, { page, size, sort }: Pageable) {
    return this.watchListRepository.getFullWatchList(userId, { page, size, sort });
  }
}
