import { Inject } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";

import { TVShowEntity } from "../entities/tv-show.entity";

export class TVShowRepository {
  @Inject(TVShowEntity)
  private tvShowModel: MongooseModel<TVShowEntity>;

  async add(tvShow: TVShowEntity): Promise<TVShowEntity> {
    return this.tvShowModel.create(tvShow);
  }

  async findById(id: string): Promise<TVShowEntity | null> {
    return this.tvShowModel.findById(id);
  }
}
