import { Inject } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";
import { UserEntity } from "../entities/user.entity";

export class UserRepository {
  @Inject(UserEntity)
  private userModel: MongooseModel<UserEntity>;

  async add(user: UserEntity): Promise<UserEntity> {
    return this.userModel.create(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userModel.findById({ _id: id });
  }
}
