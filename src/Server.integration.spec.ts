import SuperTest from "supertest";

import { PlatformTest } from "@tsed/common";

import { Server } from "./Server";

describe("Server", () => {
  beforeAll(PlatformTest.bootstrap(Server));
  afterAll(PlatformTest.reset);

  it("should call GET /api", async () => {
    const request = SuperTest(PlatformTest.callback());
    const response = await request.get("/api").expect(404);

    expect(response.body).toEqual({
      errors: [],
      message: 'Resource "/api" not found',
      name: "NOT_FOUND",
      status: 404
    });
  });
});
