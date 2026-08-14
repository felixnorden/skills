import { describe, test, expect } from "bun:test";
import { isNone, isSome, redirect, matchQrspiPath } from "../events";

describe("matchQrspiPath", () => {
  test("returns none for no .qrspi dir", () => {
    const res = matchQrspiPath("wrong/path");
    expect(isNone(res)).toBe(true);
  });

  test("returns none for no artifact option in .qrspi dir", () => {
    const res = matchQrspiPath(".qrspi/wrong/");
    expect(isNone(res)).toBe(true);
  });

  test("returns some for artifact option in .qrspi dir", () => {
    const res = matchQrspiPath(".qrspi/research/");
    expect(isSome(res)).toBe(true);
  });

  test("returns some for artifact option in .qrspi dir (no lagging /)", () => {
    const res = matchQrspiPath(".qrspi/research");
    expect(isSome(res)).toBe(true);
  });

  test("returns some for artifact file (md) in .qrspi dir", () => {
    const res = matchQrspiPath(".qrspi/research/test.md");
    expect(isSome(res)).toBe(true);
  });

  test("returns some for artifact file (txt) in .qrspi dir", () => {
    const res = matchQrspiPath(".qrspi/research/test.txt");
    expect(isSome(res)).toBe(true);
  });

  test("returns none for artifact path deeper than artifact option", () => {
    const res = matchQrspiPath(".qrspi/research/banana/");
    expect(isNone(res)).toBe(true);
  });

  test("returns none for artifact file deeper than artifact option", () => {
    const res = matchQrspiPath(".qrspi/research/banana/test.md");
    expect(isNone(res)).toBe(true);
  });
});

describe("redirect", () => {
  test("returns none for no match", () => {
    const res = redirect("wrong/path", "", matchQrspiPath);
    expect(isNone(res)).toBe(true);
  });

  test("returns none for no valid artifact path", () => {
    const res = redirect("wrong/.qrspi/path", "", matchQrspiPath);
    expect(isNone(res)).toBe(true);
  });

  test("returns some for valid artifact path", () => {
    const res = redirect("foo/.qrspi/plans", "bar", matchQrspiPath);
    expect(isSome(res)).toBe(true);
    if (res.status === "some") {
      expect(res.value).toBe("bar/.qrspi/plans");
    }
  });

  test("returns some for valid artifact file", () => {
    const res = redirect("foo/.qrspi/plans/test.md", "bar", matchQrspiPath);
    expect(isSome(res)).toBe(true);
    if (res.status === "some") {
      expect(res.value).toBe("bar/.qrspi/plans/test.md");
    }
  });
});
