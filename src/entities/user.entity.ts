import { Model, Unique } from "@tsed/mongoose";
import { Property } from "@tsed/schema";

import { Genre } from "../types";
import { BaseEntity } from "./base.entity";

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
