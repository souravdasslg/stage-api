import { MovieEntity } from "@/entities/movie.entity";

import { Inject, Injectable } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";

@Injectable()
export class MovieRepository {
  @Inject(MovieEntity)
  private movieModel: MongooseModel<MovieEntity>;

  async add(movie: MovieEntity): Promise<MovieEntity> {
    return this.movieModel.create(movie);
  }

  async findById(id: string): Promise<MovieEntity | null> {
    return this.movieModel.findById(id);
  }

  async find(): Promise<MovieEntity[]> {
    return this.movieModel.find();
  }
}
