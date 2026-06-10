import React, { useState } from "react";
import { render, act } from "@testing-library/react";
import { expect, it } from "vitest";
import { useFallbackId, useStableId } from "../useStableId";

function Probe({ useIdImpl }: { useIdImpl: () => string }) {
  const id = useIdImpl();
  const [, setTick] = useState(0);
  return (
    <button data-id={id} onClick={() => setTick((t) => t + 1)}>
      {id}
    </button>
  );
}

it("useStableId resolves to React.useId on React 18+", () => {
  expect(useStableId).toBe(React.useId);
});

it("useFallbackId is stable across rerenders and unique per instance", () => {
  const { container } = render(
    <>
      <Probe useIdImpl={useFallbackId} />
      <Probe useIdImpl={useFallbackId} />
    </>
  );
  const [a, b] = Array.from(container.querySelectorAll("button"));
  const idA = a.textContent;
  const idB = b.textContent;
  expect(idA).not.toBe(idB);
  act(() => a.click());
  expect(a.textContent).toBe(idA);
});
