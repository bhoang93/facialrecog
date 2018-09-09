import React, { Component } from "react";

class ErrorBound extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  componentDidCatch(error, info) {
    this.setState({ hasErorr: true });
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something wen't wrong.</h1>;
    }
    return this.props.children;
  }
}

export default ErrorBound;
