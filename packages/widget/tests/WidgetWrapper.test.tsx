import React from "react";
import { act } from "react-dom/test-utils";
import { render, screen } from "@testing-library/react";
import {
  GlobalProvider,
  getEventListener,
  MarqueeEvents,
} from "@vscode-marquee/utils";

import wrapper from "../src";

jest.mock("../../utils/src/contexts/Global");

test("renders component correctly", async () => {
  const listener = getEventListener<MarqueeEvents>();
  const dragHandle = <div>DragHandle</div>;
  const Widget = wrapper((props: any) => <div {...props}>hello world</div>);
  render(
    <GlobalProvider>
      {/* @ts-expect-error */}
      <Widget name="testWidget" dragHandle={dragHandle}>
        <div>fooloo</div>
      </Widget>
    </GlobalProvider>
  );
  expect(screen.getByText("hello world")).toBeInTheDocument();
  expect(screen.getByText("DragHandle")).toBeInTheDocument();
  act(() => {
    listener.emit("updateWidgetDisplay", { testWidget: false });
  });

  expect(screen.queryByText("hello world")).not.toBeInTheDocument();
  expect(screen.queryByText("DragHandle")).not.toBeInTheDocument();
});
