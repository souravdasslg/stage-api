import { expect, describe, it, beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";
import { PlatformTest } from "@tsed/common";
import SuperTest from "supertest";
import { Server } from "@/Server";
import { WatchListService } from "../../../services/watchList.service";
// import { WatchListController } from "./watch-list.controller";

vi.mock("../../../services/watchList.service");

describe("WatchListController", () => {
  beforeAll(async () => {
    await PlatformTest.bootstrap(Server)();
  });

  afterAll(async () => {
    await PlatformTest.reset();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    PlatformTest.create();
  });
  afterEach(PlatformTest.reset);

  describe("GET /watch-list", () => {
    it("should return the watch list", async () => {
      const request = SuperTest(PlatformTest.callback());
      const response = await request.get("/api/watch-list").expect(200);
      expect(response.body).toHaveProperty("items");
    });

    it("should return 401 if not authenticated", async () => {
      const request = SuperTest(PlatformTest.callback());
      const response = await request.get("/api/watch-list").expect(401);
      expect(response.body).toHaveProperty("message", "Unauthorized");
    });
  });

  describe("GET /watch-list/full", () => {
    it("should return the full watch list with pagination", async () => {
      const request = SuperTest(PlatformTest.callback());
      const response = await request.get("/api/watch-list/full?page=1&size=10").expect(206);
      expect(response.body).toHaveProperty("items");
      expect(response.body).toHaveProperty("totalItems");
      expect(response.body).toHaveProperty("totalPages");
      expect(response.body).toHaveProperty("currentPage");
    });

    it("should return 401 if not authenticated", async () => {
      const request = SuperTest(PlatformTest.callback());
      const response = await request.get("/api/watch-list/full").expect(401);
      expect(response.body).toHaveProperty("message", "Unauthorized");
    });
  });

  describe("POST /watch-list", () => {
    it("should add media to the watch list", async () => {
      vi.spyOn(WatchListService, "addMedia").mockResolvedValue({ message: "Media added to watch list" } as any);
      const request = SuperTest(PlatformTest.callback());
      const payload = { mediaId: "some-media-id" };
      const response = await request.post("/api/watch-list").send(payload).expect(200);
      expect(response.body).toHaveProperty("message", "Media added to watch list");
    });

    it("should return 400 if mediaId is missing", async () => {
      const request = SuperTest(PlatformTest.callback());
      const payload = {};
      const response = await request.post("/api/watch-list").send(payload).expect(400);
      expect(response.body).toHaveProperty("message", "Bad Request");
    });

    it("should return 401 if not authenticated", async () => {
      const request = SuperTest(PlatformTest.callback());
      const payload = { mediaId: "some-media-id" };
      const response = await request.post("/api/watch-list").send(payload).expect(401);
      expect(response.body).toHaveProperty("message", "Unauthorized");
    });
  });

  describe("DELETE /watch-list", () => {
    it("should remove media from the watch list", async () => {
      const request = SuperTest(PlatformTest.callback());
      const payload = { mediaId: "some-media-id" };
      const response = await request.delete("/api/watch-list").send(payload).expect(200);
      expect(response.body).toHaveProperty("message", "Media removed from watch list");
    });

    it("should return 404 if media is not found in the watch list", async () => {
      const request = SuperTest(PlatformTest.callback());
      const payload = { mediaId: "non-existent-media-id" };
      const response = await request.delete("/api/watch-list").send(payload).expect(404);
      expect(response.body).toHaveProperty("message", "Media not found in watch list");
    });

    it("should return 401 if not authenticated", async () => {
      const request = SuperTest(PlatformTest.callback());
      const payload = { mediaId: "some-media-id" };
      const response = await request.delete("/api/watch-list").send(payload).expect(401);
      expect(response.body).toHaveProperty("message", "Unauthorized");
    });
  });
});
