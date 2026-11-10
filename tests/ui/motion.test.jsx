import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import {
  render,
  screen,
  cleanup,
  act,
  fireEvent,
} from "@testing-library/react";
import {
  AnimatedNumber,
  Celebration,
  Reveal,
  TiltCard,
} from "../../src/components/Motion.jsx";

const numberDisplay = (value) => screen.getByText(String(value), { selector: ".sr-only" }).parentElement.querySelector("[aria-hidden]");

let observers = [];
let mediaListeners = [];
let reduced = false;
const originalMedia = window.matchMedia;
const originalObserver = window.IntersectionObserver;
const originalRaf = window.requestAnimationFrame;
const originalCancel = window.cancelAnimationFrame;
function installMedia(value = false) {
  reduced = value;
  window.matchMedia = () => ({
    get matches() {
      return reduced;
    },
    addEventListener(_name, listener) {
      mediaListeners.push(listener);
    },
    removeEventListener(_name, listener) {
      mediaListeners = mediaListeners.filter((item) => item !== listener);
    },
  });
}
afterEach(() => {
  cleanup();
  window.matchMedia = originalMedia;
  window.IntersectionObserver = originalObserver;
  window.requestAnimationFrame = originalRaf;
  window.cancelAnimationFrame = originalCancel;
  observers = [];
  mediaListeners = [];
});

test("reduced motion shows final counts, visible content and no confetti", () => {
  installMedia(true);
  const { container } = render(
    <>
      <AnimatedNumber value={17} />
      <Reveal>Readable content</Reveal>
      <Celebration />
    </>,
  );
  assert.equal(numberDisplay(17).textContent, "17");
  assert.equal(screen.getByText("Readable content").dataset.visible, "true");
  assert.equal(container.querySelector(".paws-celebration"), null);
});

test("count-up animates toward its accessible value and cancels frames on unmount", () => {
  installMedia();
  let callback;
  let cancelled = 0;
  window.requestAnimationFrame = (fn) => {
    callback = fn;
    return 7;
  };
  window.cancelAnimationFrame = (id) => {
    assert.equal(id, 7);
    cancelled++;
  };
  const view = render(<AnimatedNumber value={20} />);
  assert.equal(numberDisplay(20).textContent, "0");
  act(() => callback(100));
  act(() => callback(425));
  const halfway = Number(numberDisplay(20).textContent);
  assert.ok(halfway > 0 && halfway < 20);
  act(() => callback(750));
  assert.equal(numberDisplay(20).textContent, "20");
  view.rerender(<AnimatedNumber value={25} />);
  view.unmount();
  assert.ok(cancelled >= 1);
});

test("reveals observe once, become visible and disconnect cleanly", () => {
  installMedia();
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
      this.disconnects = 0;
      observers.push(this);
    }
    observe(element) {
      this.element = element;
    }
    disconnect() {
      this.disconnects++;
    }
  };
  const view = render(<Reveal>Scroll section</Reveal>);
  assert.equal(screen.getByText("Scroll section").dataset.visible, "false");
  act(() => observers[0].callback([{ isIntersecting: true }]));
  assert.equal(screen.getByText("Scroll section").dataset.visible, "true");
  assert.equal(observers[0].disconnects, 1);
  view.unmount();
  assert.equal(observers[0].disconnects, 2);
});

test("mouse tilt is bounded and resets; reduced motion disables pointer effects", () => {
  installMedia();
  render(<TiltCard data-testid="card">Pet card</TiltCard>);
  const card = screen.getByTestId("card");
  card.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: 100,
    height: 100,
  });
  function move() {
    const event = new MouseEvent("pointermove", {
      bubbles: true,
      clientX: 500,
      clientY: 500,
    });
    Object.defineProperty(event, "pointerType", { value: "mouse" });
    fireEvent(card, event);
  }
  move();
  assert.equal(card.style.getPropertyValue("--paws-tilt-x"), "-2.00deg");
  assert.equal(card.style.getPropertyValue("--paws-tilt-y"), "2.00deg");
  fireEvent.pointerLeave(card);
  assert.equal(card.style.getPropertyValue("--paws-tilt-y"), "0deg");
  act(() => {
    reduced = true;
    mediaListeners.forEach((listener) => listener());
  });
  move();
  assert.equal(card.style.getPropertyValue("--paws-tilt-y"), "0deg");
});

test("celebrations are decorative, finite and cleaned up on unmount", () => {
  installMedia();
  const oldSet = window.setTimeout,
    oldClear = window.clearTimeout;
  let callback,
    cleared = false;
  window.setTimeout = (fn, delay) => {
    assert.equal(delay, 1600);
    callback = fn;
    return 22;
  };
  window.clearTimeout = (id) => {
    assert.equal(id, 22);
    cleared = true;
  };
  try {
    const view = render(<Celebration />);
    assert.equal(
      view.container
        .querySelector(".paws-celebration")
        .getAttribute("aria-hidden"),
      "true",
    );
    assert.equal(
      view.container.querySelectorAll(".paws-celebration-piece").length,
      14,
    );
    act(() => callback());
    assert.equal(view.container.querySelector(".paws-celebration"), null);
    view.unmount();
    assert.ok(cleared);
  } finally {
    window.setTimeout = oldSet;
    window.clearTimeout = oldClear;
  }
});
