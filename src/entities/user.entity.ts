import { Model, Unique } from "@tsed/mongoose";
import { Format, Property } from "@tsed/schema";
import { BaseEntity } from "./base.entity";
import { Genre } from "../types";

@Model({ name: "user", schemaOptions: { timestamps: true } })
export class UserEntity extends BaseEntity {
  @Property()
  name: string;

  @Property()
  @Unique()
  username: string;

  @Property()
  preferences: {
    favoriteGenres: Genre[];
    dislikedGenres: Genre[];
  };

  @Property()
  watchHistory: Array<{
    contentId: string;
    watchedOn: Date;
    rating?: number;
  }>;
}
