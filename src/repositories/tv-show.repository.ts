import { TVShowEntity } from "@/entities/tv-show.entity";

import { Inject } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";

export class TVShowRepository {
  @Inject(TVShowEntity)
  private tvShowModel: MongooseModel<TVShowEntity>;

  async add(tvShow: TVShowEntity): Promise<TVShowEntity> {
    return this.tvShowModel.create(tvShow);
  }

  async findById(id: string): Promise<TVShowEntity | null> {
    return this.tvShowModel.findById(id);
  }

  async find(): Promise<TVShowEntity[]> {
    return this.tvShowModel.find();
  }
}
