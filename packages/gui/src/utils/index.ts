import type { MarqueeWindow } from '@vscode-marquee/utils'

declare const window: MarqueeWindow

const ERROR_MESSAGE = 'Couldn\'t send feedback message!'

export const ucFirst = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export async function sendFeedbackRequest (feedback: string, email: string) {
  const url = `${window.marqueeBackendBaseUrl}/submitFeedback`
  console.log(`Send feedback from ${email}`)
  const res = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({ feedback, email }),
    headers: { 'Content-Type': 'application/json', 'x-foo': 'bar' }
  }).catch(() => { throw new Error(ERROR_MESSAGE) })

  if (!res.ok) {
    throw new Error(`${ERROR_MESSAGE} (status: ${res.status})`)
  }
}
