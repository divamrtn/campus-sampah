import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app";

describe("Edukasi", () => {
  it("POST /api/edukasi tanpa token => 401 (hanya staf)", async () => {
    expect((await request(app).post("/api/edukasi").send({})).status).toBe(401);
  });

  it("GET /api/edukasi/admin/semua tanpa token => 401", async () => {
    expect((await request(app).get("/api/edukasi/admin/semua")).status).toBe(401);
  });
});
