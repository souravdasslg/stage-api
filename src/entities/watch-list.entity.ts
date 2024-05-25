import { BaseEntity } from "./base.entity";
import { DateFormat, Description, Format, Property, Required, DateTime } from "@tsed/schema";
import { Model, MongooseIndex, MongoosePlugin, PreHook, Ref, Unique } from "@tsed/mongoose";
import { TVShowEntity } from "./tv-show.entity";
import { MovieEntity } from "./movie.entity";
import { MediaType } from "../types";

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
