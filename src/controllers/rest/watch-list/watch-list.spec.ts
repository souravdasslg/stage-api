import { Server } from "@/Server";
import sampleMovie from "@/bin/seed/movies.json";
import sampleTVShow from "@/bin/seed/tv-series.json";
import { UserEntity } from "@/entities/user.entity";
import { MovieRepository } from "@/repositories/movies.repository";
import { TVShowRepository } from "@/repositories/tv-show.repository";
import { UserRepository } from "@/repositories/user.repository";
import { WatchListRepository } from "@/repositories/watchlist.repository";
import { Genre, MediaType } from "@/types";
import SuperTest from "supertest";

import { PlatformTest } from "@tsed/common";
import { PlatformExpress } from "@tsed/platform-express";
import { TestMongooseContext } from "@tsed/testing-mongoose";

describe("Server", () => {
  let authUser: UserEntity;

  beforeAll(async () => {
    await TestMongooseContext.bootstrap(Server, { platform: PlatformExpress, cache: false })();

    // Ensure repositories are correctly injected
    const UserRepo = await PlatformTest.invoke<UserRepository>(UserRepository);
    const MovieRepo = await PlatformTest.invoke<MovieRepository>(MovieRepository);
    const TVShowRepo = await PlatformTest.invoke<TVShowRepository>(TVShowRepository);

    // Map string genres to Genre enum
    const mapGenres = (genres: string[]): Genre[] => {
      return genres.map((genre) => Genre[genre as keyof typeof Genre]);
    };

    await Promise.all(
      sampleMovie.map((movie) => {
        movie.genres = mapGenres(movie.genres);
        return MovieRepo.add({
          ...movie,
          releaseDate: new Date(movie.releaseDate),
          genres: mapGenres(movie.genres)
        });
      })
    );
    await Promise.all(
      sampleTVShow.map((tvShow) => {
        tvShow.genres = mapGenres(tvShow.genres);
        tvShow.episodes = tvShow.episodes.map((episode) => ({
          ...episode,
          releaseDate: new Date(episode.releaseDate).toISOString()
        }));
        return TVShowRepo.add({
          ...tvShow,
          genres: mapGenres(tvShow.genres),
          episodes: tvShow.episodes as any
        });
      })
    );

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
  it("should check if user is authorized to access DELETE /api/watch-list", async () => {
    const request = SuperTest(PlatformTest.callback());
    const response = await request.delete("/api/watch-list/invalid-id").set("x-user-id", "invalid-user-id").expect(401);
    expect(response.body.message).toEqual("Unauthorized");
  });

  it("should delete an entry from the watch list", async () => {
    const request = SuperTest(PlatformTest.callback());
    const fetchResponse = await request.get("/api/watch-list").set("x-user-id", authUser._id!.toString()).expect(200);
    const watchList = fetchResponse.body.data;

    expect(watchList.length).toBeGreaterThan(0);

    const itemIdToDelete = watchList[0]._id;
    await request.delete(`/api/watch-list/${itemIdToDelete}`).set("x-user-id", authUser._id!.toString()).expect(200);

    const fetchResponseAfterDelete = await request.get("/api/watch-list").set("x-user-id", authUser._id!.toString()).expect(200);
    const updatedWatchList = fetchResponseAfterDelete.body.data;
    expect(updatedWatchList).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: itemIdToDelete })]));
  });

  it("should return an error when trying to delete with an invalid id", async () => {
    const request = SuperTest(PlatformTest.callback());
    const invalidId = "6651928a9c58d8cf572e2fb1";
    const response = await request.delete(`/api/watch-list/${invalidId}`).set("x-user-id", authUser._id!.toString()).expect(404);
    expect(response.body.message).toEqual("Invalid watch list item ID");
  });

  it("should check if user is authorized to access GET /api/watch-list/paginated", async () => {
    const request = SuperTest(PlatformTest.callback());
    const response = await request.get("/api/watch-list/paginated").set("x-user-id", "invalid-user-id").expect(401);
    expect(response.body.message).toEqual("Unauthorized");
  });

  it("should return a paginated list of watch list items", async () => {
    const request = SuperTest(PlatformTest.callback());

    // Fetch movie and TV show data
    const MovieRepo = await PlatformTest.invoke<MovieRepository>(MovieRepository);
    const TVShowRepo = await PlatformTest.invoke<TVShowRepository>(TVShowRepository);
    const watchListRepo = await PlatformTest.invoke<WatchListRepository>(WatchListRepository);

    const movies = await MovieRepo.find();
    const tvShows = await TVShowRepo.find();

    for (let i = 0; i < 10; i++) {
      const movie = movies[i % movies.length];
      const tvShow = tvShows[i % tvShows.length];
      await watchListRepo.addMediaToWatchList({
        userId: authUser._id!.toString(),
        mediaType: MediaType.Movie,
        movie: movie._id!.toString()
      });
      await watchListRepo.addMediaToWatchList({
        userId: authUser._id!.toString(),
        mediaType: MediaType.TVShow,
        tvShow: tvShow._id!.toString()
      });
    }

    // Call the paginated endpoint
    const page = 1;
    const size = 3;
    const paginatedResponse = await request
      .get(`/api/watch-list/paginated?page=${page}&size=${size}`)
      .set("x-user-id", authUser._id!.toString())
      .expect(206);

    expect(paginatedResponse.body.data.length).toBeLessThanOrEqual(size);
    expect(paginatedResponse.body.totalCount).toBeGreaterThan(0);
  });
});
