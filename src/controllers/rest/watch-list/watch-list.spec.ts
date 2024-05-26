import SuperTest from "supertest";

import { PlatformTest } from "@tsed/common";
import { PlatformExpress } from "@tsed/platform-express";
import { TestMongooseContext } from "@tsed/testing-mongoose";

import { Server } from "../../../Server";
import { UserEntity } from "../../../entities/user.entity";
import { MovieRepository } from "../../../repositories/movies.repository";
import { TVShowRepository } from "../../../repositories/tv-show.repository";
import { UserRepository } from "../../../repositories/user.repository";
import { Genre } from "../../../types";

describe("Server", () => {
  let authUser: UserEntity;

  beforeAll(async () => {
    await TestMongooseContext.bootstrap(Server, { platform: PlatformExpress, cache: false })();

    const UserRepo = PlatformTest.get<UserRepository>(UserRepository);
    const MovieRepo = PlatformTest.get<MovieRepository>(MovieRepository);
    const TVShowRepo = PlatformTest.get<TVShowRepository>(TVShowRepository);

    authUser = await UserRepo.add({
      name: "Bhavna Patel",
      username: "bhavnap",
      preferences: { favoriteGenres: [Genre.Action, Genre.Comedy], dislikedGenres: [Genre.Romance] },
      watchHistory: [{ contentId: "movie3", watchedOn: new Date(1678406400000), rating: 4 }]
    });
  });
  afterAll(PlatformTest.reset);

  it("should check if user is authorized to access /api/watch-list", async () => {
    const request = SuperTest(PlatformTest.callback());
    const response = await request.get("/api/watch-list").set("x-user-id", "invalid-user-id").expect(401);
    expect(response.body.message).toEqual("Unauthorized");
  });

  it("should call GET /api/watch-list", async () => {
    const request = SuperTest(PlatformTest.callback());
    const response = await request.get("/api/watch-list").set("x-user-id", authUser._id!.toString()).expect(200);
    expect(response.body.data).toEqual([]);
  });

  it("Add media to list /api/watch-list", async () => {
    const request = SuperTest(PlatformTest.callback());
    const MovieRepo = PlatformTest.get<MovieRepository>(MovieRepository);
    const movie = await MovieRepo.add({
      title: "Movie 1",
      description: "Movie 1 description",
      director: "Movie 1 director",
      actors: ["Actor 1", "Actor 2"],
      genres: [Genre.Action, Genre.Comedy],
      releaseDate: new Date()
    });
    await request
      .post("/api/watch-list")
      .set("x-user-id", authUser._id!.toString())
      .send({ mediaId: `${movie._id}` })
      .expect(200);

    const fetchResponse = await request.get("/api/watch-list").set("x-user-id", authUser._id!.toString()).expect(200);

    expect(fetchResponse.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          userId: authUser._id!.toString(),
          mediaType: expect.any(String),
          movie: expect.objectContaining({
            _id: movie._id!.toString()
          })
        })
      ])
    );
  });
});
