import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DEMO_TESTIMONIALS } from "../src/data/testimonials.ts";

describe("Customer Testimonials Data & Integrity Policy", () => {
  it("provides exactly 3 curated demo testimonials for homepage layout", () => {
    assert.equal(Array.isArray(DEMO_TESTIMONIALS), true);
    assert.equal(DEMO_TESTIMONIALS.length, 3);
  });

  it("ensures all testimonials have required fields with valid types", () => {
    for (const item of DEMO_TESTIMONIALS) {
      assert.ok(item.id && typeof item.id === "string", "Testimonial must have a string id");
      assert.ok(item.name && typeof item.name === "string", "Testimonial must have a string name");
      assert.ok(item.role && typeof item.role === "string", "Testimonial must have a client role/service");
      assert.ok(item.avatar && typeof item.avatar === "string", "Testimonial must have an avatar URL");
      assert.ok(typeof item.rating === "number", "Rating must be a number");
      assert.ok(item.review && typeof item.review === "string", "Testimonial must have review content");
    }
  });

  it("enforces 5-star rating scale and valid numerical boundaries", () => {
    for (const item of DEMO_TESTIMONIALS) {
      assert.equal(item.rating, 5);
      assert.ok(item.rating >= 1 && item.rating <= 5);
    }
  });

  it("uses secure HTTPS avatar image URLs", () => {
    for (const item of DEMO_TESTIMONIALS) {
      assert.ok(item.avatar.startsWith("https://"), "Avatar URL must use HTTPS protocol");
    }
  });

  it("contains authentic, substantial sample review prose without placeholder tokens", () => {
    for (const item of DEMO_TESTIMONIALS) {
      assert.ok(item.review.length > 50, "Review should be sufficiently descriptive (>50 chars)");
      assert.equal(item.review.includes("Lorem ipsum"), false);
      assert.equal(item.review.includes("TODO"), false);
    }
  });
});
