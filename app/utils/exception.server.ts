import { Exception } from "~/api";

export const getException = (error: any): Exception => {
  if (
    typeof error === "object" &&
    "error" in error &&
    "statusCode" in error.error &&
    "message" in error.error
  ) {
    return error.error;
  }
  throw error;
};
