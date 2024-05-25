import { PlatformTest } from "@tsed/common";
import SuperTest from "supertest";
import { Server } from "../../../Server";

describe("Server", () => {
  beforeAll(PlatformTest.bootstrap(Server));
  afterAll(PlatformTest.reset);

  it("should call GET /api/watch-list", async () => {
    const request = SuperTest(PlatformTest.callback());
    const response = await request.get("/api/watch-list").set("x-user-id", "6651928a9c58d8cf572e2fb0").expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          __v: expect.any(Number),
          _id: expect.any(String),
          createdAt: expect.any(String),
          mediaType: expect.any(String),
          movie: expect.objectContaining({
            __v: expect.any(Number),
            _id: expect.any(String),
            actors: expect.arrayContaining([expect.any(String)]),
            createdAt: expect.any(String),
            description: expect.any(String),
            director: expect.any(String),
            genres: expect.arrayContaining([expect.any(String)]),
            releaseDate: expect.any(String),
            title: expect.any(String),
            updatedAt: expect.any(String)
          }),
          updatedAt: expect.any(String),
          userId: expect.any(String)
        })
      ])
    );
  });

  it("Add media to list /api/watch-list", async () => {
    const request = SuperTest(PlatformTest.callback());
    const response = await request
      .post("/api/watch-list")
      .set("x-user-id", "6651928a9c58d8cf572e2fb0")
      .send({ mediaId: "6651928b9c58d8cf572e2fc8" })
      .expect(200);

    const fetchResponse = await request.get("/api/watch-list").set("x-user-id", "6651928a9c58d8cf572e2fb0").expect(200);

    expect(fetchResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          userId: "6651928a9c58d8cf572e2fb0",
          mediaType: expect.any(String),
          movie: expect.objectContaining({
            _id: "6651928b9c58d8cf572e2fc8"
          })
        })
      ])
    );
  });
});
