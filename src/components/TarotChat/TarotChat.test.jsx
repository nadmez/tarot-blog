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

const OTHER_CARDS = [
  {
    name: "The Moon",
    name_short: "ar18",
    image_url: "/assets/images/themoon.jpeg",
  },
  {
    name: "The Star",
    name_short: "ar17",
    image_url: "/assets/images/thestar.jpeg",
  },
  {
    name: "The Tower",
    name_short: "ar16",
    image_url: "/assets/images/thetower.jpeg",
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

function stubTurnOffsets(step) {
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(
    function () {
      return this.tagName === "ARTICLE"
        ? [...this.parentElement.children].indexOf(this) * step
        : 0;
    }
  );
}

function scrollPaneTo(top) {
  const log = screen.getByRole("log");
  log.scrollTop = top;
  fireEvent.scroll(log);
}

async function askAndWait(text, reply) {
  ask(text);
  await screen.findByText(reply);
  await waitFor(() =>
    expect(screen.getByLabelText("Sorunuzu yazın")).toBeEnabled()
  );
}

const cardArea = () => screen.getByRole("region", { name: "Çekilen kartlar" });

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
  vi.restoreAllMocks();
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

test.each([
  ["message is null", { message: null, cards: [] }],
  ["message field is missing", { cards: [] }],
])(
  "shows an error when the server responds OK but %s",
  async (_label, body) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse(body)));
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<TarotChat />);

    ask("Soru");

    expect(await screen.findByRole("alert")).toHaveTextContent(ERROR_TEXT);
    expect(
      screen.queryByRole("status", { name: "Yanıt yazılıyor" })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Sorunuzu yazın")).toBeEnabled();
  }
);

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

test("shows the cards of the question scrolled to the top of the pane", async () => {
  stubTurnOffsets(400);
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(okResponse({ message: "Yanıt 1", cards: CARDS }))
      .mockResolvedValueOnce(
        okResponse({ message: "Yanıt 2", cards: OTHER_CARDS })
      )
  );
  render(<TarotChat />);

  await askAndWait("Soru 1", "Yanıt 1");
  await askAndWait("Soru 2", "Yanıt 2");
  expect(
    within(cardArea()).getByRole("img", { name: "The Moon" })
  ).toBeInTheDocument();

  scrollPaneTo(0);
  expect(
    within(cardArea()).getByRole("img", { name: "The Magician" })
  ).toBeInTheDocument();
  expect(
    within(cardArea()).queryByRole("img", { name: "The Moon" })
  ).not.toBeInTheDocument();

  scrollPaneTo(400);
  expect(
    within(cardArea()).getByRole("img", { name: "The Moon" })
  ).toBeInTheDocument();
  expect(
    within(cardArea()).queryByRole("img", { name: "The Magician" })
  ).not.toBeInTheDocument();
});

test("keeps the earlier question's cards when a newer answer arrives while scrolled up", async () => {
  stubTurnOffsets(400);
  let resolveSecond;
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(okResponse({ message: "Yanıt 1", cards: CARDS }))
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSecond = resolve;
        })
      )
  );
  render(<TarotChat />);

  await askAndWait("Soru 1", "Yanıt 1");
  ask("Soru 2");
  scrollPaneTo(0);
  resolveSecond(okResponse({ message: "Yanıt 2", cards: OTHER_CARDS }));
  await screen.findByText("Yanıt 2");

  expect(
    within(cardArea()).getByRole("img", { name: "The Magician" })
  ).toBeInTheDocument();
  expect(
    within(cardArea()).queryByRole("img", { name: "The Moon" })
  ).not.toBeInTheDocument();

  scrollPaneTo(400);
  expect(
    within(cardArea()).getByRole("img", { name: "The Moon" })
  ).toBeInTheDocument();
});

test("shows placeholders when a failed question is scrolled back to the top", async () => {
  stubTurnOffsets(400);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(okResponse({ message: "Yanıt 2", cards: CARDS }))
  );
  render(<TarotChat />);

  ask("Soru 1");
  expect(await screen.findByRole("alert")).toBeInTheDocument();
  expect(screen.getAllByText("Kart henüz çekilmedi")).toHaveLength(3);
  await askAndWait("Soru 2", "Yanıt 2");

  scrollPaneTo(0);
  expect(screen.getAllByText("Kart henüz çekilmedi")).toHaveLength(3);
  expect(within(cardArea()).queryByRole("img")).not.toBeInTheDocument();
});

test.each([
  ["an empty card list", { message: "Yanıt", cards: [] }],
  ["no card list", { message: "Yanıt" }],
])("shows placeholders for an answer with %s", async (_, body) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse(body)));
  render(<TarotChat />);

  await askAndWait("Soru", "Yanıt");

  expect(screen.getAllByText("Kart henüz çekilmedi")).toHaveLength(3);
});

test("shows exactly three cards when two questions drew the same cards", async () => {
  stubTurnOffsets(400);
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(okResponse({ message: "Yanıt 1", cards: CARDS }))
      .mockResolvedValueOnce(okResponse({ message: "Yanıt 2", cards: CARDS }))
  );
  render(<TarotChat />);

  await askAndWait("Soru 1", "Yanıt 1");
  await askAndWait("Soru 2", "Yanıt 2");
  scrollPaneTo(0);

  expect(within(cardArea()).getAllByRole("img")).toHaveLength(3);
});
