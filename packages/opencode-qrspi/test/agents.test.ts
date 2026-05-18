import { describe, test, expect } from "bun:test";
import { mergePermission, type AgentPermission } from "../agents.ts";

describe("mergePermission", () => {
  test("returns oldPermission when newPermission is undefined", () => {
    const oldPermission: AgentPermission = "allow";
    const newPermission: AgentPermission = undefined;
    expect(mergePermission(oldPermission, newPermission)).toBe(oldPermission);
  });

  test("returns newPermission when newPermission is a string", () => {
    const oldPermission: AgentPermission = "deny";
    const newPermission: AgentPermission = "allow";
    expect(mergePermission(oldPermission, newPermission)).toBe("allow");
  });

  test("returns newPermission string even when oldPermission is an object", () => {
    const oldPermission: AgentPermission = { "*": "ask", foo: "allow" };
    const newPermission: AgentPermission = "deny";
    expect(mergePermission(oldPermission, newPermission)).toBe("deny");
  });

  test("returns newPermission object when oldPermission is undefined", () => {
    const oldPermission: AgentPermission = undefined;
    const newPermission: AgentPermission = { foo: "allow", bar: "deny" };
    expect(mergePermission(oldPermission, newPermission)).toEqual({ foo: "allow", bar: "deny" });
  });

  test("returns newPermission object when oldPermission is string and newPermission has no * key", () => {
    const oldPermission: AgentPermission = "ask";
    const newPermission: AgentPermission = { foo: "allow", bar: "deny" };
    expect(mergePermission(oldPermission, newPermission)).toEqual({ foo: "allow", bar: "deny" });
  });

  test("uses oldPermission string as * value when newPermission object contains * key", () => {
    const oldPermission: AgentPermission = "ask";
    const newPermission: AgentPermission = { "*": "allow", foo: "deny" };
    expect(mergePermission(oldPermission, newPermission)).toEqual({ "*": "ask", foo: "deny" });
  });

  test("sets * to undefined when oldPermission is undefined and newPermission has * key", () => {
    const oldPermission: AgentPermission = undefined;
    const newPermission: AgentPermission = { "*": "allow", foo: "deny" };
    expect(mergePermission(oldPermission, newPermission)).toEqual({ "*": undefined, foo: "deny" });
  });

  test("copies old keys and overrides with new keys except * when both are objects", () => {
    const oldPermission: AgentPermission = { "*": "ask", foo: "allow", bar: "deny" };
    const newPermission: AgentPermission = { foo: "deny", baz: "allow" };
    expect(mergePermission(oldPermission, newPermission)).toEqual({
      "*": "ask",
      foo: "deny",
      bar: "deny",
      baz: "allow",
    });
  });

  test("preserves old * and ignores new * when both are objects", () => {
    const oldPermission: AgentPermission = { "*": "ask" };
    const newPermission: AgentPermission = { "*": "deny" };
    expect(mergePermission(oldPermission, newPermission)).toEqual({ "*": "ask" });
  });

  test("skips new * key even when old has no * key", () => {
    const oldPermission: AgentPermission = { foo: "allow" };
    const newPermission: AgentPermission = { "*": "deny", bar: "ask" };
    expect(mergePermission(oldPermission, newPermission)).toEqual({ foo: "allow", bar: "ask" });
  });

  test("handles empty oldPermission object", () => {
    const oldPermission: AgentPermission = {};
    const newPermission: AgentPermission = { foo: "allow" };
    expect(mergePermission(oldPermission, newPermission)).toEqual({ foo: "allow" });
  });

  test("handles empty newPermission object", () => {
    const oldPermission: AgentPermission = { foo: "allow" };
    const newPermission: AgentPermission = {};
    expect(mergePermission(oldPermission, newPermission)).toEqual({ foo: "allow" });
  });
});
