import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app";

describe("Sampah", () => {
  it("GET /api/sampah tanpa token => 401", async () => {
    expect((await request(app).get("/api/sampah")).status).toBe(401);
  });

  it("POST /api/sampah tanpa token => 401", async () => {
    expect((await request(app).post("/api/sampah").send({ beratKg: 1 })).status).toBe(401);
  });

  it("PATCH /api/sampah/SMP-1001/verifikasi tanpa token => 401", async () => {
    const res = await request(app).patch("/api/sampah/SMP-1001/verifikasi").send({ status: "Terverifikasi" });
    expect(res.status).toBe(401);
  });
});
