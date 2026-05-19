# Core Guidelines

## Ownership
- `packages/core` holds framework-agnostic domain types, application logic, ports, and small adapters that stay independent of app runtimes.
- This package is the shared contract between `apps/api` and `apps/web`.

## Relevant Docs
- `docs/concepts/mental-model.md`
- `docs/concepts/tentacles.md`
- `docs/concepts/runtime-and-api.md`
- `docs/reference/api.md`
- `docs/reference/filesystem-layout.md`
- Read these when changing shared domain terminology, runtime contracts, persistence-facing types, or cross-app behavior.

## Boundaries
- No React, HTTP server, PTY, process execution, filesystem persistence, or browser-specific behavior here.
- Prefer pure functions and explicit interfaces over runtime-coupled helpers.
- If logic needs app infrastructure to run, keep the interface in core and the implementation in the owning app.

## Design
- Keep the ports-and-adapters split clear:
  - `domain/` for core types and concepts
  - `application/` for use-case logic
  - `ports/` for system boundaries
  - lightweight adapters only when they stay framework-agnostic
- Avoid leaking app-specific naming or transport details into shared types unless that detail is truly part of the domain contract.

## Change Discipline
- Be cautious with exported types and functions. Changes here usually affect both apps.
- When modifying shared contracts, update the dependent call sites and add tests that pin the behavior from the core package outward.
- Prefer additive changes and normalization helpers over breaking contract churn.

## Adding a New Application Use-Case

Every file under `src/application/` follows the same pattern: a pure async function that accepts a port interface and returns a domain value. No infrastructure, no side effects.

**Pattern (copy this when adding the next use-case):**

```ts
// src/application/buildYourThing.ts
import type { YourPort } from "../ports/YourPort";
import type { YourDomainValue } from "../domain/yourDomain";

export const buildYourThing = async (
  reader: YourPort,
): Promise<YourDomainValue[]> => {
  const raw = await reader.listThings();
  // pure transformation here — no I/O after this point
  return raw.filter((item) => item.active);
};
```

**Port interface (src/ports/YourPort.ts):**

```ts
import type { YourDomainValue } from "../domain/yourDomain";

export interface YourPort {
  listThings(): Promise<YourDomainValue[]>;
}
```

**In-memory adapter for tests (src/adapters/InMemoryYourPort.ts):**

```ts
import type { YourDomainValue } from "../domain/yourDomain";
import type { YourPort } from "../ports/YourPort";

export class InMemoryYourPort implements YourPort {
  constructor(private readonly items: YourDomainValue[]) {}

  async listThings(): Promise<YourDomainValue[]> {
    return this.items;
  }
}
```

**Test (tests/buildYourThing.test.ts):**

```ts
import { describe, expect, it } from "vitest";
import { InMemoryYourPort } from "../src/adapters/InMemoryYourPort";
import { buildYourThing } from "../src/application/buildYourThing";

describe("buildYourThing", () => {
  it("returns only active items", async () => {
    const port = new InMemoryYourPort([
      { id: "a", active: true },
      { id: "b", active: false },
    ]);
    const result = await buildYourThing(port);
    expect(result.map((x) => x.id)).toEqual(["a"]);
  });
});
```

**Checklist:**
1. Add the domain type to `src/domain/<name>.ts` if it doesn't exist.
2. Declare the port interface in `src/ports/<Name>Port.ts`.
3. Write the pure function in `src/application/build<Name>.ts`.
4. Add the in-memory adapter in `src/adapters/InMemory<Name>Port.ts`.
5. Export all four from `src/index.ts`.
6. Write at least one vitest test in `tests/build<Name>.test.ts`.

See `src/application/buildTerminalList.ts` and `tests/buildTerminalList.test.ts` as the reference implementation.
