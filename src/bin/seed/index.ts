import { WatchListRepository } from "@/repositories/watchlist.repository";

import { Command, CommandProvider, Inject, QuestionOptions } from "@tsed/cli-core";

import { MovieEntity } from "../../entities/movie.entity";
import { TVShowEntity } from "../../entities/tv-show.entity";
import { UserEntity } from "../../entities/user.entity";
import { MovieRepository } from "../../repositories/movies.repository";
import { TVShowRepository } from "../../repositories/tv-show.repository";
import { UserRepository } from "../../repositories/user.repository";
import { Genre, MediaType } from "../../types";
import sampleMovies from "./movies.json";
import sampleTvSeries from "./tv-series.json";
import sampleUsers from "./users.json";

export interface SeedContext {
  watchlist: boolean;
}

@Command({
  name: "seed",
  description: "Seed the database with data",
  args: {},
  options: {
    "--watchlist": {
      type: Boolean,
      description: "List of data to seed",
      required: false,
      defaultValue: false
    }
  },
  allowUnknownOption: false
})
export class Seed implements CommandProvider {
  @Inject(MovieRepository)
  private movieRepository: MovieRepository;

  @Inject(TVShowRepository)
  private tvShowRepository: TVShowRepository;

  @Inject(UserRepository)
  private userRepository: UserRepository;

  @Inject(WatchListRepository)
  private watchListRepository: WatchListRepository;

  async $prompt(initialOptions: Partial<SeedContext>): Promise<QuestionOptions> {
    return [];
  }

  $mapContext(ctx: Partial<SeedContext>): SeedContext {
    return {
      ...ctx,
      watchlist: ctx.watchlist ?? false
    };
  }
  async $exec(ctx: SeedContext): Promise<any> {
    return [
      {
        title: "✨ Seeding the database",
        task: async () => {
          /** Add Users */
          console.log("Adding users...");
          await Promise.all(
            sampleUsers.map((user) => {
              const userEntity: UserEntity = {
                ...user,
                preferences: {
                  favoriteGenres: user.preferences.favoriteGenres.map((genre) => genre as Genre),
                  dislikedGenres: user.preferences.dislikedGenres.map((genre) => genre as Genre)
                },
                watchHistory: user.watchHistory.map((history) => ({
                  ...history,
                  watchedOn: new Date(history.watchedOn)
                }))
              };
              return this.userRepository.add(userEntity);
            })
          );
          // /** Add Movies */
          console.log("Adding movies...");
          await Promise.all(
            sampleMovies.map((movie) => {
              const movieEntity: MovieEntity = {
                ...movie,
                releaseDate: new Date(movie.releaseDate),
                genres: movie.genres.map((genre) => genre as Genre)
              };
              return this.movieRepository.add(movieEntity);
            })
          );
          // /** Add TV Shows */
          // console.log("Adding TV Shows...");
          await Promise.all(
            sampleTvSeries.map((tvShow) => {
              const tvShowEntity: TVShowEntity = {
                ...tvShow,
                genres: tvShow.genres.map((genre) => genre as Genre),
                episodes: tvShow.episodes.map((episode) => ({
                  ...episode,
                  releaseDate: new Date(episode.releaseDate)
                }))
              };
              return this.tvShowRepository.add(tvShowEntity);
            })
          );
          /** Add WatchList */

          if (ctx.watchlist) {
            const user = await this.userRepository.findByUserName(sampleUsers[0].username);
            const movies = await this.movieRepository.find();
            const tvShows = await this.tvShowRepository.find();

            const firstTenMovies = movies.slice(0, 10);
            const firstTenTvShows = tvShows.slice(0, 10);

            for (const movie of firstTenMovies) {
              await this.watchListRepository.addMediaToWatchList({
                userId: user!._id!.toString(),
                mediaType: MediaType.Movie,
                movie: movie._id!.toString()
              });

              for (const tvShow of firstTenTvShows) {
                await this.watchListRepository.addMediaToWatchList({
                  userId: user!._id!.toString(),
                  mediaType: MediaType.TVShow,
                  tvShow: tvShow._id!.toString()
                });
              }
            }
          }
        }
      }
    ];
  }
}
