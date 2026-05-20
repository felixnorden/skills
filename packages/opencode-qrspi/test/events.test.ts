import { describe, test, expect } from "bun:test";
import { isNone, isSome, redirect, matchQrspiPath } from "../events";

describe("matchQrspiPath", () => {
  test("returns none for no .opencode dir", () => {
    const res = matchQrspiPath("wrong/path");
    expect(isNone(res)).toBe(true);
  });

  test("returns none for no artifact option in .opencode dir", () => {
    const res = matchQrspiPath(".opencode/wrong/");
    expect(isNone(res)).toBe(true);
  });

  test("returns some for artifact option in .opencode dir", () => {
    const res = matchQrspiPath(".opencode/research/");
    expect(isSome(res)).toBe(true);
  });

  test("returns some for artifact option in .opencode dir (no lagging /)", () => {
    const res = matchQrspiPath(".opencode/research");
    expect(isSome(res)).toBe(true);
  });

  test("returns some for artifact file (md) in .opencode dir", () => {
    const res = matchQrspiPath(".opencode/research/test.md");
    expect(isSome(res)).toBe(true);
  });

  test("returns some for artifact file (txt) in .opencode dir", () => {
    const res = matchQrspiPath(".opencode/research/test.txt");
    expect(isSome(res)).toBe(true);
  });

  test("returns none for artifact path deeper than artifact option", () => {
    const res = matchQrspiPath(".opencode/research/banana/");
    expect(isNone(res)).toBe(true);
  });

  test("returns none for artifact file deeper than artifact option", () => {
    const res = matchQrspiPath(".opencode/research/banana/test.md");
    expect(isNone(res)).toBe(true);
  });
});

describe("redirect", () => {
  test("returns none for no match", () => {
    const res = redirect("wrong/path", "", matchQrspiPath);
    expect(isNone(res)).toBe(true);
  });

  test("returns none for no valid artifact path", () => {
    const res = redirect("wrong/.opencode/path", "", matchQrspiPath);
    expect(isNone(res)).toBe(true);
  });

  test("returns some for valid artifact path", () => {
    const res = redirect("foo/.opencode/plans", "bar", matchQrspiPath);
    expect(isSome(res)).toBe(true);
    if (res.status === "some") {
      expect(res.value).toBe("bar/.opencode/plans");
    }
  });

  test("returns some for valid artifact file", () => {
    const res = redirect("foo/.opencode/plans/test.md", "bar", matchQrspiPath);
    expect(isSome(res)).toBe(true);
    if (res.status === "some") {
      expect(res.value).toBe("bar/.opencode/plans/test.md");
    }
  });
});
