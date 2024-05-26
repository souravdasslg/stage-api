import { Model } from "@tsed/mongoose";
import { Enum, Property } from "@tsed/schema";

import { Genre } from "../types";
import { BaseEntity } from "./base.entity";

@Model({ name: "tvshow", schemaOptions: { timestamps: true, autoIndex: true } })
export class TVShowEntity extends BaseEntity {
  @Property()
  title: string;

  @Property()
  description: string;

  @Property()
  @Enum(Genre)
  genres: Genre[];

  @Property()
  episodes: Array<{
    episodeNumber: number;
    seasonNumber: number;
    releaseDate: Date;
    director: string;
    actors: string[];
  }>;
}
