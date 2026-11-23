import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app";

describe("Poin, reward & penukaran", () => {
  it.each(["/api/poin/saya", "/api/poin", "/api/reward", "/api/penukaran", "/api/dashboard"])(
    "GET %s tanpa token => 401",
    async (path) => {
      expect((await request(app).get(path)).status).toBe(401);
    },
  );

  it("POST /api/penukaran tanpa token => 401", async () => {
    expect((await request(app).post("/api/penukaran").send({ rewardId: 1 })).status).toBe(401);
  });
});
