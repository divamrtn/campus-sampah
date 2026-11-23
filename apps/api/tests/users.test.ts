import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app";

describe("Users", () => {
  it.each(["/api/users", "/api/users/me", "/api/users/1"])("GET %s tanpa token => 401", async (path) => {
    const res = await request(app).get(path);
    expect(res.status).toBe(401);
  });

  it("POST /api/users tanpa token => 401", async () => {
    const res = await request(app).post("/api/users").send({});
    expect(res.status).toBe(401);
  });
});
