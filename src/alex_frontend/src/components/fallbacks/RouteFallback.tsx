import React from "react";
import { useRouteError } from "react-router";
import ErrorFallback from "./ErrorFallback";

const RouteFallback = () => {
    const error = useRouteError();

    if (error instanceof Error) {
        return <ErrorFallback error={error} />;
    }

    const customError = new Error('Unknown error');

    return <ErrorFallback error={customError} />;
};


export default RouteFallback