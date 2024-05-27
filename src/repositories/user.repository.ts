import { UserEntity } from "@/entities/user.entity";

import { Inject, Injectable } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";
import { UseCache } from "@tsed/platform-cache";

@Injectable()
export class UserRepository {
  @Inject(UserEntity)
  private userModel: MongooseModel<UserEntity>;

  async add(user: UserEntity): Promise<UserEntity> {
    return this.userModel.create(user);
  }

  async findByUserName(userName: string): Promise<UserEntity | null> {
    return this.userModel.findOne({ username: userName });
  }

  @UseCache({ canCache: "no-nullish" })
  async findById(id: string): Promise<UserEntity | null> {
    return this.userModel.findById({ _id: id });
  }
}
