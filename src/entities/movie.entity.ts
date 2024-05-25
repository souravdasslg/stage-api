import { Model } from "@tsed/mongoose";
import { Enum, Property } from "@tsed/schema";
import { BaseEntity } from "./base.entity";
import { Genre } from "../types";

@Model({ name: "movie", schemaOptions: { timestamps: true } })
export class MovieEntity extends BaseEntity {
  @Property()
  title: string;

  @Property()
  description: string;

  @Property()
  @Enum(Genre)
  genres: Genre[];

  @Property()
  releaseDate: Date;

  @Property()
  director: string;

  @Property()
  actors: string[];
}
