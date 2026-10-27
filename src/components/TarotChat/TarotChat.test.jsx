import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import TarotChat from ".";

const CARDS = [
  {
    name: "The Magician",
    name_short: "ar01",
    image_url: "/assets/images/themagician.jpeg",
  },
  {
    name: "The Fool",
    name_short: "ar00",
    image_url: "/assets/images/thefool.jpeg",
  },
  {
    name: "The Sun",
    name_short: "ar19",
    image_url: "/assets/images/thesun.jpeg",
  },
];

const ERROR_TEXT = "Bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin.";

function okResponse(body) {
  return { ok: true, json: async () => body };
}

function ask(text) {
  fireEvent.change(screen.getByLabelText("Sorunuzu yazın"), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: "Gönder" }));
}

let played;

beforeEach(() => {
  played = [];
  vi.stubGlobal(
    "Audio",
    class {
      constructor(src) {
        this.src = src;
      }
      play() {
        played.push(this.src);
        return Promise.resolve();
      }
    }
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("starts with three card placeholders and no messages", () => {
  vi.stubGlobal("fetch", vi.fn());
  render(<TarotChat />);

  expect(screen.getAllByText("Kart henüz çekilmedi")).toHaveLength(3);
  expect(screen.getByRole("log")).toBeEmptyDOMElement();
});

test("posts the prompt with a conversation id and shows the reply and cards", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(
      okResponse({ message: "Kartlar umut gösteriyor.", cards: CARDS })
    );
  vi.stubGlobal("fetch", fetchMock);
  render(<TarotChat />);

  ask("Aşk hayatım nasıl olacak?");

  expect(
    await screen.findByText("Kartlar umut gösteriyor.")
  ).toBeInTheDocument();
  expect(screen.getByText("Aşk hayatım nasıl olacak?")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "The Magician" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "The Fool" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "The Sun" })).toBeInTheDocument();

  expect(fetchMock).toHaveBeenCalledOnce();
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe("/api/chat");
  expect(init.method).toBe("POST");
  expect(init.headers).toEqual({ "Content-Type": "application/json" });
  const body = JSON.parse(init.body);
  expect(body.prompt).toBe("Aşk hayatım nasıl olacak?");
  expect(body.conversationId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
  );
});

test("reuses the same conversation id for follow-up messages", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(okResponse({ message: "Yanıt", cards: CARDS }));
  vi.stubGlobal("fetch", fetchMock);
  render(<TarotChat />);

  ask("İlk soru");
  await screen.findByText("Yanıt");
  await waitFor(() =>
    expect(screen.getByLabelText("Sorunuzu yazın")).toBeEnabled()
  );

  ask("İkinci soru");
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

  const ids = fetchMock.mock.calls.map(
    ([, init]) => JSON.parse(init.body).conversationId
  );
  expect(ids[0]).toBe(ids[1]);
});

test("shows a typing indicator, disables input and resets cards while waiting", async () => {
  let resolveFetch;
  const pending = new Promise((resolve) => {
    resolveFetch = resolve;
  });
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(
      okResponse({ message: "Birinci yanıt", cards: CARDS })
    )
    .mockReturnValueOnce(pending);
  vi.stubGlobal("fetch", fetchMock);
  render(<TarotChat />);

  ask("İlk soru");
  await screen.findByText("Birinci yanıt");
  expect(screen.getByRole("img", { name: "The Magician" })).toBeInTheDocument();

  ask("İkinci soru");

  expect(
    await screen.findByRole("status", { name: "Yanıt yazılıyor" })
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Sorunuzu yazın")).toBeDisabled();
  expect(
    screen.queryByRole("img", { name: "The Magician" })
  ).not.toBeInTheDocument();
  expect(screen.getAllByText("Kart henüz çekilmedi")).toHaveLength(3);

  resolveFetch(okResponse({ message: "İkinci yanıt", cards: CARDS }));
  await screen.findByText("İkinci yanıt");
  expect(
    screen.queryByRole("status", { name: "Yanıt yazılıyor" })
  ).not.toBeInTheDocument();
  expect(screen.getByLabelText("Sorunuzu yazın")).toBeEnabled();
});

test("shows an error message when the request fails and lets the user retry", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
  vi.spyOn(console, "error").mockImplementation(() => {});
  render(<TarotChat />);

  ask("Soru");

  expect(await screen.findByRole("alert")).toHaveTextContent(ERROR_TEXT);
  expect(screen.getByLabelText("Sorunuzu yazın")).toBeEnabled();
  expect(
    screen.queryByRole("status", { name: "Yanıt yazılıyor" })
  ).not.toBeInTheDocument();
});

test("treats a non-OK server response as an error", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
  vi.spyOn(console, "error").mockImplementation(() => {});
  render(<TarotChat />);

  ask("Soru");

  expect(await screen.findByRole("alert")).toHaveTextContent(ERROR_TEXT);
});

test("plays a pop sound when sending and a notification sound on reply", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(okResponse({ message: "Yanıt", cards: [] }))
  );
  render(<TarotChat />);

  ask("Soru");
  expect(played).toEqual(["/sounds/pop.mp3"]);

  await screen.findByText("Yanıt");
  expect(played).toEqual(["/sounds/pop.mp3", "/sounds/notification.mp3"]);
});

test("keeps the error inside the failed question's turn after asking again", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(okResponse({ message: "Yanıt", cards: CARDS }))
  );
  vi.spyOn(console, "error").mockImplementation(() => {});
  render(<TarotChat />);

  ask("Soru 1");
  await screen.findByRole("alert");
  ask("Soru 2");
  await screen.findByText("Yanıt");

  const [failed, answered] = screen.getAllByRole("article");
  expect(within(failed).getByText("Soru 1")).toBeInTheDocument();
  expect(within(failed).getByRole("alert")).toHaveTextContent(ERROR_TEXT);
  expect(within(answered).queryByRole("alert")).not.toBeInTheDocument();
  expect(within(answered).getByText("Yanıt")).toBeInTheDocument();
});

test("shows the typing indicator inside the pending question's turn", async () => {
  vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
  render(<TarotChat />);

  ask("Soru");

  const article = screen.getByRole("article");
  expect(within(article).getByText("Soru")).toBeInTheDocument();
  expect(
    await within(article).findByRole("status", { name: "Yanıt yazılıyor" })
  ).toBeInTheDocument();
});
