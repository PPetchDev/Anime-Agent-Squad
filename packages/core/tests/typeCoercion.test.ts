import { describe, expect, it } from "vitest";

import { asNumber, asRecord, asString } from "../src/util/typeCoercion";

describe("asRecord", () => {
  it("returns the object when given a plain object", () => {
    const obj = { a: 1, b: "hello" };
    expect(asRecord(obj)).toBe(obj);
  });

  it("returns null for arrays", () => {
    expect(asRecord([])).toBeNull();
    expect(asRecord([1, 2, 3])).toBeNull();
  });

  it("returns null for null", () => {
    expect(asRecord(null)).toBeNull();
  });

  it("returns null for primitives", () => {
    expect(asRecord("string")).toBeNull();
    expect(asRecord(42)).toBeNull();
    expect(asRecord(true)).toBeNull();
    expect(asRecord(undefined)).toBeNull();
  });

  it("accepts empty objects", () => {
    expect(asRecord({})).toEqual({});
  });

  it("accepts nested objects", () => {
    const nested = { a: { b: 2 } };
    expect(asRecord(nested)).toBe(nested);
  });
});

describe("asNumber", () => {
  it("returns the number when given a finite number", () => {
    expect(asNumber(42)).toBe(42);
    expect(asNumber(0)).toBe(0);
    expect(asNumber(-3.14)).toBe(-3.14);
  });

  it("parses numeric strings", () => {
    expect(asNumber("42")).toBe(42);
    expect(asNumber("3.14")).toBe(3.14);
    expect(asNumber("-7")).toBe(-7);
    expect(asNumber("0")).toBe(0);
  });

  it("returns null for NaN", () => {
    expect(asNumber(NaN)).toBeNull();
  });

  it("returns null for strings that parse to NaN", () => {
    expect(asNumber("not-a-number")).toBeNull();
    expect(asNumber("abc")).toBeNull();
    expect(asNumber("")).toBeNull();
  });

  it("returns null for Infinity", () => {
    expect(asNumber(Infinity)).toBeNull();
    expect(asNumber(-Infinity)).toBeNull();
  });

  it("returns null for non-number non-string types", () => {
    expect(asNumber(null)).toBeNull();
    expect(asNumber(undefined)).toBeNull();
    expect(asNumber({})).toBeNull();
    expect(asNumber([])).toBeNull();
    expect(asNumber(true)).toBeNull();
  });
});

describe("asString", () => {
  it("returns the string as-is for string values", () => {
    expect(asString("hello")).toBe("hello");
    expect(asString("")).toBe("");
  });

  it("returns null for non-string types", () => {
    expect(asString(42)).toBeNull();
    expect(asString(null)).toBeNull();
    expect(asString(undefined)).toBeNull();
    expect(asString({})).toBeNull();
    expect(asString([])).toBeNull();
    expect(asString(true)).toBeNull();
  });
});
