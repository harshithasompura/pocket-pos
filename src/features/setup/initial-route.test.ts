import { describe, expect, it } from "vitest";

import { getInitialRoute } from "./initial-route";

describe("getInitialRoute", () => {
  it("routes new businesses to setup", () => expect(getInitialRoute(false)).toBe("/setup"));
  it("routes configured businesses to tabs", () => expect(getInitialRoute(true)).toBe("/(tabs)"));
});
