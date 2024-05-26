import { ObjectId } from "mongodb";

import { Context } from "@tsed/common";
import { useDecorators } from "@tsed/core";
import { Inject } from "@tsed/di";
import { Unauthorized } from "@tsed/exceptions";
import { Middleware, MiddlewareMethods, UseAuth } from "@tsed/platform-middlewares";
import { In, Returns } from "@tsed/schema";

import { UserRepository } from "../repositories/user.repository";

@Middleware()
export class AuthMiddleware implements MiddlewareMethods {
  @Inject(UserRepository)
  private userRepository: UserRepository;

  async use(@Context() ctx: Context) {
    const userId = ctx.request.headers["x-user-id"] as string;
    if (!ObjectId.isValid(userId)) {
      throw new Unauthorized("Unauthorized");
    }
    if (userId) {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Unauthorized("Unauthorized");
      }
      ctx.user = user;
    }
  }
}

export interface CustomAuthOptions extends Record<string, unknown> {
  role?: string;
  scopes?: string[];
}

export function Auth(options: CustomAuthOptions = {}): Function {
  return useDecorators(
    UseAuth(AuthMiddleware, options),
    In("header").Name("x-user-id").Type(String).Required(true).Description("Take any user id from the Database"),
    Returns(401),
    Returns(403)
  );
}
