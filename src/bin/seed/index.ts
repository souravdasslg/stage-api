import { Command, CommandProvider, Inject, QuestionOptions } from "@tsed/cli-core";
import { MovieRepository } from "../../repositories/movies.repository";
import { TVShowRepository } from "../../repositories/tv-show.repository";
import { MovieEntity } from "../../entities/movie.entity";
import { TVShowEntity } from "../../entities/tv-show.entity";

import sampleMovies from "./movies.json";
import sampleTvSeries from "./tv-series.json";
import sampleUsers from "./users.json";

import { Genre } from "../../types";
import { UserEntity } from "../../entities/user.entity";
import { UserRepository } from "../../repositories/user.repository";

export interface SeedContext {}

@Command({
  name: "seed",
  description: "Seed the database with data",
  args: {},
  options: {},
  allowUnknownOption: false
})
export class Seed implements CommandProvider {
  @Inject(MovieRepository)
  private movieRepository: MovieRepository;

  @Inject(TVShowRepository)
  private tvShowRepository: TVShowRepository;

  @Inject(UserRepository)
  private userRepository: UserRepository;

  async $prompt(initialOptions: Partial<SeedContext>): Promise<QuestionOptions> {
    return [];
  }

  $mapContext(ctx: Partial<SeedContext>): SeedContext {
    return {
      ...ctx
      // map something, based on ctx
    };
  }
  async $exec(ctx: SeedContext): Promise<any> {
    return [
      {
        title: "✨ Seeding the database",
        task: async () => {
          /** Add Users */
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
          /** Add Movies */
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
          /** Add TV Shows */
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
        }
      }
    ];
  }
}
