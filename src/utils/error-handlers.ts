import "server-only";

// APIs error handlers
export function formatError(error: any) {
  if (process.env.NODE_ENV !== "production") {
    return {
      message: error.message,
      code: error.code,
      detail: error.detail,
      where: error.where,
      stack: error.stack,
    };
  } else {
    return {
      message: error.message,
      code: error.code,
    };
  }
}
