import React from 'react';

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  { error: any | undefined }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <h2>An error occured</h2>
          <p>Details:</p>
          <p>{String(this.state.error)}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
