import { Property, Required } from "@tsed/schema";

export class AddToWatchListPayload {
  @Property()
  @Required()
  mediaId: string;

  @Property()
  seasonId: string;
}
