import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app";

describe("Auth & infrastruktur", () => {
  it("GET /api/health => 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("route tidak dikenal => 404", async () => {
    const res = await request(app).get("/api/tidak-ada");
    expect(res.status).toBe(404);
  });

  it("login tanpa body => 422", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("register dengan data tidak lengkap => 422", async () => {
    const res = await request(app).post("/api/auth/register").send({ username: "ab", email: "bukan-email" });
    expect(res.status).toBe(422);
    const fields = res.body.errors.map((e: any) => e.field);
    expect(fields).toEqual(expect.arrayContaining(["username", "email", "password", "nim"]));
  });

  it("GET /api/auth/me tanpa token => 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("token palsu => 401", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer palsu");
    expect(res.status).toBe(401);
  });
});
