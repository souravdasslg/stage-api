import { Inject } from "@tsed/di";
import { Middleware, MiddlewareMethods, UseAuth } from "@tsed/platform-middlewares";
import { UserRepository } from "../repositories/user.repository";
import { Context, Req } from "@tsed/common";
import { Unauthorized } from "@tsed/exceptions";
import { useDecorators } from "@tsed/core";
import { In, Returns } from "@tsed/schema";

@Middleware()
export class AuthMiddleware implements MiddlewareMethods {
  @Inject(UserRepository)
  private userRepository: UserRepository;

  async use(@Req() request: Req, @Context() ctx: Context) {
    if (ctx.request.headers && ctx.request.headers["x-user-id"]) {
      const user = await this.userRepository.findById(ctx.request.headers["x-user-id"] as string);
      ctx.user = user;
      if (!user) {
        throw new Unauthorized("Unauthorized");
      }
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
