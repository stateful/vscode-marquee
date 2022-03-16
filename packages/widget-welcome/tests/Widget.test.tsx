import React from "react";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { GlobalProvider, getEventListener } from "@vscode-marquee/utils";

import Widget from "../src";
import { TrickProvider } from "../src/Context";
import type { State, Events } from "../src/types";

jest.mock("../../utils/src/contexts/Global");

declare const window: {
  vscode: any;
};

beforeAll(() => {
  window.vscode = { postMessage: jest.fn() };
});

test("renders component correctly", async () => {
  const listener = getEventListener<State & Events>(
    "@vscode-marquee/welcome-widget"
  );
  const { container } = render(
    <GlobalProvider>
      <TrickProvider>
        <Widget.component />
      </TrickProvider>
    </GlobalProvider>
  );
  const tipp =
    "Hey there 👋 you are using a pre-release version of Marquee. Thanks for testing out the extension and make sure to leave us feedback ☺️";
  expect(screen.getByText(tipp)).toBeInTheDocument();
  act(() => {
    listener.emit("tricks", [
      {
        order: 1,
        id: "1",
        content: "Hello World!",
        title: "Here am I",
        active: false,
        notify: false,
        createdAt: Date.now(),
        votes: { upvote: 123 },
      },
    ]);
  });
  act(() => {
    listener.emit("read", ["1"]);
  });
  expect(screen.getByText(tipp)).toBeInTheDocument();
  act(() => {
    listener.emit("read", []);
  });

  expect(window.vscode.postMessage).toBeCalledTimes(0);
  userEvent.click(screen.getByText("Like"));
  expect(window.vscode.postMessage).toBeCalledTimes(1);
  expect(window.vscode.postMessage.mock.calls).toMatchSnapshot();

  userEvent.click(screen.getByText("Mark as read"));
  expect(screen.queryByText("Hello World!")).not.toBeInTheDocument();
  expect(screen.getByText(tipp)).toBeInTheDocument();
  userEvent.click(container.querySelectorAll("button svg")[0]);
});
