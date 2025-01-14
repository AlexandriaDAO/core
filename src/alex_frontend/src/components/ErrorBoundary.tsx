import React, { Component, ReactNode } from "react";
import ErrorFallback from "./ErrorFallback";

interface Props {
	children: ReactNode;
}

interface State {
	error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		error: null,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { error: error };
	}

	public componentDidCatch(error: Error) {
		console.log('error', error);
		this.setState({ error: error });
		// console.error("Uncaught error:", error, errorInfo);
	}

	public render() {
		if (this.state.error) {
			return <ErrorFallback error={this.state.error} />
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
