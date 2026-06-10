import React from "react";
import { render, act, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { SCWidget } from "../SCWidget";
import { useSCWidget } from "../useSCWidget";
import { SCWidgetEvents } from "../types";
import { installSC, type MockWidget } from "./helpers";

const URL = "https://soundcloud.com/artist/track";

let sc: ReturnType<typeof installSC>;

beforeEach(() => {
  sc = installSC();
});

function Harness() {
  const { ref, state, props } = useSCWidget();
  return (
    <>
      <SCWidget ref={ref} url={URL} {...props} />
      <output data-testid="state">
        {JSON.stringify({
          isReady: state.isReady,
          isPlaying: state.isPlaying,
          positionMs: state.positionMs,
          durationMs: state.durationMs,
          title: state.sound?.title ?? null,
          soundIndex: state.soundIndex,
        })}
      </output>
    </>
  );
}

function readState() {
  return JSON.parse(screen.getByTestId("state").textContent!);
}

async function mountHarness(): Promise<MockWidget> {
  render(<Harness />);
  await act(async () => {});
  expect(sc.created.length).toBe(1);
  return sc.created[0];
}

it("populates duration, sound, and soundIndex on READY", async () => {
  const mock = await mountHarness();
  expect(readState()).toMatchObject({ isReady: false, durationMs: 0, title: null });
  await act(async () => {
    mock.emit(SCWidgetEvents.READY);
  });
  expect(readState()).toMatchObject({
    isReady: true,
    durationMs: 123456,
    title: "Test Track",
    soundIndex: 0,
  });
});

it("tracks isPlaying across play/pause/finish", async () => {
  const mock = await mountHarness();
  const payload = { relativePosition: 0, loadProgress: 0, currentPosition: 0 };
  await act(async () => mock.emit(SCWidgetEvents.PLAY, payload));
  expect(readState().isPlaying).toBe(true);
  await act(async () => mock.emit(SCWidgetEvents.PAUSE, payload));
  expect(readState().isPlaying).toBe(false);
  await act(async () => mock.emit(SCWidgetEvents.PLAY, payload));
  await act(async () => mock.emit(SCWidgetEvents.FINISH, payload));
  expect(readState().isPlaying).toBe(false);
});

it("updates positionMs on SEEK (e.g. seeking while paused)", async () => {
  const mock = await mountHarness();
  await act(async () =>
    mock.emit(SCWidgetEvents.SEEK, {
      relativePosition: 0.5,
      loadProgress: 1,
      currentPosition: 60000,
    })
  );
  expect(readState().positionMs).toBe(60000);
});

it("updates positionMs on PLAY_PROGRESS", async () => {
  const mock = await mountHarness();
  await act(async () =>
    mock.emit(SCWidgetEvents.PLAY_PROGRESS, {
      relativePosition: 0.1,
      loadProgress: 0.5,
      currentPosition: 12345,
    })
  );
  expect(readState().positionMs).toBe(12345);
});

it("controls proxy to the widget through the ref", async () => {
  let controls!: ReturnType<typeof useSCWidget>["controls"];
  function ControlHarness() {
    const hook = useSCWidget();
    controls = hook.controls;
    return <SCWidget ref={hook.ref} url={URL} {...hook.props} />;
  }
  render(<ControlHarness />);
  await act(async () => {});
  const mock = sc.created[0];
  controls.play();
  controls.seekTo(3000);
  expect(mock.widget.play).toHaveBeenCalledTimes(1);
  expect(mock.widget.seekTo).toHaveBeenCalledWith(3000);
});

it("hook callbacks compose with consumer-provided handlers via onEvent", async () => {
  // useSCWidget's props use the named handler slots; a consumer adding their
  // own listener should use onEvent so both fire.
  const consumerOnPlay = vi.fn();
  function ComposedHarness() {
    const { ref, state, props } = useSCWidget();
    return (
      <>
        <SCWidget
          ref={ref}
          url={URL}
          {...props}
          onEvent={{ [SCWidgetEvents.PLAY]: consumerOnPlay }}
        />
        <output data-testid="state">{JSON.stringify({ isPlaying: state.isPlaying })}</output>
      </>
    );
  }
  render(<ComposedHarness />);
  await act(async () => {});
  await act(async () =>
    sc.created[0].emit(SCWidgetEvents.PLAY, {
      relativePosition: 0,
      loadProgress: 0,
      currentPosition: 0,
    })
  );
  expect(consumerOnPlay).toHaveBeenCalledTimes(1);
  expect(readState().isPlaying).toBe(true);
});
