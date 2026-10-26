import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import ChatInput from ".";

function setup(props = {}) {
  const onSubmit = vi.fn();
  render(<ChatInput onSubmit={onSubmit} {...props} />);
  return {
    onSubmit,
    textarea: screen.getByLabelText("Sorunuzu yazın"),
    send: screen.getByRole("button", { name: "Gönder" }),
  };
}

test("limits the prompt to 1000 characters", () => {
  const { textarea } = setup();

  expect(textarea).toHaveAttribute("maxlength", "1000");
});

test("disables sending while the prompt is empty or only whitespace", () => {
  const { textarea, send } = setup();
  expect(send).toBeDisabled();

  fireEvent.change(textarea, { target: { value: "   " } });
  expect(send).toBeDisabled();

  fireEvent.change(textarea, { target: { value: "Merhaba" } });
  expect(send).toBeEnabled();
});

test("submits the trimmed prompt and clears the field on send click", () => {
  const { onSubmit, textarea, send } = setup();

  fireEvent.change(textarea, { target: { value: "  Merhaba  " } });
  fireEvent.click(send);

  expect(onSubmit).toHaveBeenCalledExactlyOnceWith("Merhaba");
  expect(textarea).toHaveValue("");
});

test("submits on Enter but adds a new line on Shift+Enter", () => {
  const { onSubmit, textarea } = setup();
  fireEvent.change(textarea, { target: { value: "Merhaba" } });

  fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
  expect(onSubmit).not.toHaveBeenCalled();

  fireEvent.keyDown(textarea, { key: "Enter" });
  expect(onSubmit).toHaveBeenCalledExactlyOnceWith("Merhaba");
});

test("does not submit an empty prompt on Enter", () => {
  const { onSubmit, textarea } = setup();

  fireEvent.keyDown(textarea, { key: "Enter" });

  expect(onSubmit).not.toHaveBeenCalled();
});

test("disables the textarea and send button while loading", () => {
  const { textarea, send } = setup({ isLoading: true });

  expect(textarea).toBeDisabled();
  expect(send).toBeDisabled();
});
