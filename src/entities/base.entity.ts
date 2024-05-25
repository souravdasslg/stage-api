import { ObjectID, Unique, VersionKey } from "@tsed/mongoose";
import { Default } from "@tsed/schema";

export class BaseEntity {
  @ObjectID("id")
  _id?: string;

  @VersionKey()
  @Default(0)
  __v?: number;
}
