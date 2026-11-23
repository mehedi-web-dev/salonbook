import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { API_ENDPOINTS } from "../src/lib/api-config.ts";

describe("Barbers API Endpoint Configurations", () => {
  it("resolves the base barbers collection endpoint", () => {
    assert.ok(API_ENDPOINTS.BARBERS.BASE.endsWith("/api/barbers"));
  });

  it("resolves single barber resource endpoint by ID", () => {
    const testId = "674123456789abcdef012345";
    const url = API_ENDPOINTS.BARBERS.BY_ID(testId);
    assert.ok(url.endsWith(`/api/barbers/${testId}`));
  });

  it("resolves barber status toggle endpoint by ID", () => {
    const testId = "674123456789abcdef012345";
    const url = API_ENDPOINTS.BARBERS.STATUS(testId);
    assert.ok(url.endsWith(`/api/barbers/${testId}/status`));
  });
});

describe("Barber Data Formatting & Validation Schema", () => {
  // Helper mirroring frontend/backend data normalization
  function normalizeBarberPayload(input) {
    const errors = [];

    if (!input.name || typeof input.name !== "string" || input.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }

    if (!input.designation || typeof input.designation !== "string" || input.designation.trim().length < 2) {
      errors.push("Designation must be at least 2 characters");
    }

    const rawSpecs = Array.isArray(input.specialization)
      ? input.specialization
      : typeof input.specialization === "string"
      ? input.specialization.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    if (rawSpecs.length === 0) {
      errors.push("At least one specialization is required");
    }

    const expNum = Number(input.experience);
    if (input.experience === undefined || isNaN(expNum) || expNum < 0) {
      errors.push("Experience must be a valid non-negative number");
    }

    return {
      isValid: errors.length === 0,
      errors,
      normalized: errors.length === 0 ? {
        name: input.name.trim(),
        designation: input.designation.trim(),
        specialization: rawSpecs,
        experience: expNum,
        bio: typeof input.bio === "string" ? input.bio.trim() : "",
        serviceIds: Array.isArray(input.serviceIds) ? input.serviceIds : [],
        isActive: typeof input.isActive === "boolean" ? input.isActive : true,
      } : null,
    };
  }

  it("validates and normalizes complete barber creation payload", () => {
    const result = normalizeBarberPayload({
      name: "Marcus Vance",
      designation: "Master Barber",
      specialization: ["Beard Sculpting", "Classic Fade"],
      experience: 7,
      bio: "Dedicated master barber.",
      serviceIds: ["674123456789abcdef012345"],
      isActive: true,
    });

    assert.equal(result.isValid, true);
    assert.equal(result.normalized.name, "Marcus Vance");
    assert.equal(result.normalized.designation, "Master Barber");
    assert.equal(result.normalized.experience, 7);
    assert.equal(result.normalized.specialization.length, 2);
  });

  it("parses comma-separated specialization strings cleanly", () => {
    const result = normalizeBarberPayload({
      name: "Julian Rivera",
      designation: "Senior Colorist",
      specialization: "Balayage, Scissor Cut , Hair Treatment",
      experience: "5",
      isActive: true,
    });

    assert.equal(result.isValid, true);
    assert.deepEqual(result.normalized.specialization, [
      "Balayage",
      "Scissor Cut",
      "Hair Treatment",
    ]);
    assert.equal(result.normalized.experience, 5);
  });

  it("rejects invalid barber inputs with missing name or designation", () => {
    const result = normalizeBarberPayload({
      name: " ",
      designation: "",
      specialization: [],
      experience: -2,
    });

    assert.equal(result.isValid, false);
    assert.ok(result.errors.length >= 3);
  });
});
