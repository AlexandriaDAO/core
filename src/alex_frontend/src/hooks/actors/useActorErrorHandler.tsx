import { InterceptorErrorData, InterceptorRequestData, InterceptorResponseData, isIdentityExpiredError } from "ic-use-actor";
import { toast } from "sonner";

const useActorErrorHandler = (clear: () => void) => {
    const errorToast = (error: unknown) => {
        if (typeof error === "object" && error !== null && "message" in error) {
            toast.error(error.message as string);
        }
    };

    const handleResponseError = (data: InterceptorErrorData) => {
        console.error("onResponseError", data.error);
        if (isIdentityExpiredError(data.error)) {
            toast.error("Login expired.");
            setTimeout(() => {
                clear();
                window.location.reload();
            }, 1000);
            return;
        }

        if (typeof data === "object" && data !== null && "message" in data) {
            errorToast(data);
        }
    };

    const handleRequest = (data: InterceptorRequestData) => {
        console.log("onRequest", data.args, data.methodName);
        return data.args;
    };

    const handleResponse = (data: InterceptorResponseData) => {
        console.log("onResponse", data.args, data.methodName, data.response);
        return data.response;
    };

    return {
        errorToast,
        handleResponseError,
        handleRequest,
        handleResponse
    };
};

export default useActorErrorHandler;