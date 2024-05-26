import { Model, MongooseIndex, Ref } from "@tsed/mongoose";
import { Property, Required } from "@tsed/schema";

import { MediaType } from "../types";
import { BaseEntity } from "./base.entity";
import { MovieEntity } from "./movie.entity";
import { TVShowEntity } from "./tv-show.entity";

@Model({ name: "watchListMediaItems", schemaOptions: { timestamps: true } })
@MongooseIndex({ userId: 1, movie: 1, tvShow: 1 }, { unique: true })
export class WatchListMediaItem extends BaseEntity {
  @Property()
  @Required()
  userId!: string;

  @Property()
  @Required()
  mediaType!: MediaType;

  @Ref(MovieEntity)
  movie?: Ref<MovieEntity>;

  @Ref(TVShowEntity)
  tvShow?: Ref<TVShowEntity>;

  @Property()
  addedAt!: Date;
}
