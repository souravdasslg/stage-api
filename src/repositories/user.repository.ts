import { Inject, Injectable } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";
import { PlatformCache, UseCache } from "@tsed/platform-cache";

import { UserEntity } from "../entities/user.entity";

@Injectable()
export class UserRepository {
  @Inject(UserEntity)
  private userModel: MongooseModel<UserEntity>;

  async add(user: UserEntity): Promise<UserEntity> {
    return this.userModel.create(user);
  }

  @UseCache({ canCache: "no-nullish" })
  async findById(id: string): Promise<UserEntity | null> {
    return this.userModel.findById({ _id: id });
  }
}
