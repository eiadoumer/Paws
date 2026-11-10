import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import {
  render,
  screen,
  cleanup,
  within,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import App from "../../src/App.jsx";
import { MAX_PHOTO_BYTES } from "../../src/data/petValidation.js";

const actualImage = globalThis.Image;
const png = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1ZkAAAAASUVORK5CYII=",
    "base64",
  ),
);
let reject = false;
let hold = false;
let lastDecoder;
function start() {
  globalThis.Image = class {
    constructor() {
      this.naturalWidth = 1;
      this.naturalHeight = 1;
      lastDecoder = this;
    }
    set src(value) {
      this.source = value;
      if (!hold)
        queueMicrotask(() => (reject ? this.onerror?.() : this.onload?.()));
    }
  };
  render(
    <MemoryRouter initialEntries={["/pets/new"]}>
      <App />
    </MemoryRouter>,
  );
  return userEvent.setup({ applyAccept: false });
}
 
async function chooseAndUpload(user, picker, file) {
  await user.click(screen.getByRole("button", { name: "Choose File", exact: true }));
  fireEvent.change(picker, { target: { files: [file] } });
}
afterEach(() => {
  cleanup();
  globalThis.Image = actualImage;
  reject = false;
  hold = false;
  lastDecoder = undefined;
});

test("selected photo previews, saves to dashboard, survives edit, and can be removed", async () => {
  const user = start();
  await chooseAndUpload(user,
    screen.getByLabelText("Upload pet photo"),
    new File([png], "maple.png", { type: "image/png" }),
  );
  await screen.findByText("maple.png");
  const source = screen.getByAltText("Selected pet photo").getAttribute("src");
  assert.ok(source.startsWith("data:image/png;base64,"));
  assert.equal(screen.queryByLabelText("Pet photo URL"), null);
  await user.type(screen.getByLabelText(/Pet’s name/), "Poppy");
  await user.type(
    screen.getByLabelText("Age in months", { exact: false }),
    "15",
  );
  await user.type(
    screen.getByLabelText("Meet your pet", { exact: false }),
    "Poppy is a lovely companion who enjoys daily walks and quiet evenings.",
  );
  await user.click(screen.getByRole("button", { name: "Publish listing" }));
  let card = screen.getByRole("heading", { name: "Poppy" }).closest("article");
  assert.equal(within(card).getByRole("img").getAttribute("src"), source);
  await user.click(within(card).getByRole("link", { name: "Edit listing" }));
  assert.equal(
    screen.getByAltText("Selected pet photo").getAttribute("src"),
    source,
  );
  await user.click(screen.getByRole("button", { name: "Remove photo" }));
  assert.ok(screen.getByAltText("Pet illustration placeholder"));
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  card = screen.getByRole("heading", { name: "Poppy" }).closest("article");
  assert.equal(
    within(card).getByRole("img").getAttribute("src"),
    "/images/mock/dog-friendly.webp",
  );
});

test("invalid photo type and excessive size show clear errors and can be cleared", async () => {
  const user = start();
  const picker = screen.getByLabelText("Upload pet photo");
  await chooseAndUpload(user,
    picker,
    new File(["text"], "notes.txt", { type: "text/plain" }),
  );
  assert.ok(
    screen.getByRole("alert").textContent.includes("JPEG, PNG, or WebP"),
  );
  await user.click(screen.getByRole("button", { name: "Clear selection" }));
  assert.equal(screen.queryByRole("alert"), null);
  await chooseAndUpload(user,
    picker,
    new File([new Uint8Array(MAX_PHOTO_BYTES + 1)], "large.png", {
      type: "image/png",
    }),
  );
  assert.ok(screen.getByRole("alert").textContent.includes("5 MB"));
  assert.ok(screen.getByAltText("Pet illustration placeholder"));
});

test("decode failure preserves previous photo and a valid replacement recovers", async () => {
  const user = start();
  const picker = screen.getByLabelText("Upload pet photo");
  await chooseAndUpload(user,
    picker,
    new File([png], "first.png", { type: "image/png" }),
  );
  await screen.findByText("first.png");
  const oldSource = screen
    .getByAltText("Selected pet photo")
    .getAttribute("src");
  reject = true;
  await chooseAndUpload(user,
    picker,
    new File(["bad image"], "broken.png", { type: "image/png" }),
  );
  await screen.findByText(
    "This image could not be opened. Choose a different photo.",
  );
  assert.equal(
    screen.getByAltText("Selected pet photo").getAttribute("src"),
    oldSource,
  );
  reject = false;
  await chooseAndUpload(user,
    picker,
    new File([png], "replacement.png", { type: "image/png" }),
  );
  await screen.findByText("replacement.png");
  assert.equal(screen.queryByRole("alert"), null);
});

test("cancel pending upload prevents late callbacks from changing the photo", async () => {
  const user = start();
  hold = true;
  await chooseAndUpload(user,
    screen.getByLabelText("Upload pet photo"),
    new File([png], "waiting.png", { type: "image/png" }),
  );
  await waitFor(() => assert.equal(typeof lastDecoder?.onload, "function"));
  assert.ok(screen.getByRole("button", { name: "Publish listing" }).disabled);
  const lateLoad = lastDecoder.onload;
  await user.click(screen.getByRole("button", { name: "Cancel upload" }));
  act(() => lateLoad());
  assert.ok(screen.getByAltText("Pet illustration placeholder"));
  assert.equal(screen.queryByAltText("Selected pet photo"), null);
  assert.equal(
    screen.getByRole("button", { name: "Publish listing" }).disabled,
    false,
  );
});


test("only Choose File opens the picker, including keyboard activation", async () => {
  const user = start();
  const picker = screen.getByLabelText("Upload pet photo");
  let opens = 0;
  let lastClick;
  picker.addEventListener("click", (event) => { opens += 1; lastClick = event; });
  assert.equal(picker.hidden, true);
  await user.click(screen.getByText("No file chosen"));
  await user.click(screen.getByText("Pet photo", { exact: true }));
  await user.click(screen.getByText("A photo helps them find their people."));
  await user.click(screen.getByRole("group", { name: "Pet photo", exact: true }));
  assert.equal(opens, 0);
  assert.equal(fireEvent.click(picker), false, "direct native input activation must be cancelled");
  assert.equal(lastClick.defaultPrevented, true);
  opens = 0;
  const choose = screen.getByRole("button", { name: "Choose File", exact: true });
  await user.click(choose);
  assert.equal(opens, 1);
  assert.equal(lastClick.defaultPrevented, false);
  choose.focus();
  await user.keyboard("{Enter}");
  assert.equal(opens, 2);
  await user.keyboard(" ");
  assert.equal(opens, 3);
  assert.equal(lastClick.defaultPrevented, false);
  assert.equal(screen.queryByRole("alert"), null);
});
