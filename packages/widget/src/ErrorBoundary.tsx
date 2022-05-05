import React from 'react'

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary Component
 * ensures that widget is not rendered if an error is thrown during render
 */
export class ErrorBoundary extends React.Component<unknown, State> {
  constructor (props: unknown) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch () {
    this.setState({ hasError: true })
  }

  render () {
    if (this.state.hasError) {
      return null
    }

    return this.props.children
  }
}
