import React from "react"
import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"

import { getEventListener, MarqueeEvents } from "@vscode-marquee/utils"

import HideWidgetContent from "../src/HideWidgetContent"

test("should emit events properly", () => {
  const listener = getEventListener<MarqueeEvents>()
  const onOpenSettings = jest.fn()
  const onRemoveWidget = jest.fn()
  listener.on("openSettings", onOpenSettings)
  listener.on("removeWidget", onRemoveWidget)
  render(<HideWidgetContent name="foobar" />)
  expect(screen.getByText("Can be undone in")).toBeInTheDocument()

  expect(onRemoveWidget).toBeCalledTimes(0)
  userEvent.click(screen.getByRole("button", { name: "Hide this widget" }))
  expect(onRemoveWidget).toBeCalledTimes(1)

  expect(onOpenSettings).toBeCalledTimes(0)
  userEvent.click(screen.getByRole("button", { name: "" }))
  expect(onOpenSettings).toBeCalledTimes(1)
})
