export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
    public readonly errors?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const badRequest = (msg = "Permintaan tidak valid", errors?: unknown) =>
  new AppError(400, msg, "BAD_REQUEST", errors);
export const unauthorized = (msg = "Tidak terautentikasi") => new AppError(401, msg, "UNAUTHORIZED");
export const forbidden = (msg = "Anda tidak punya akses") => new AppError(403, msg, "FORBIDDEN");
export const notFound = (msg = "Data tidak ditemukan") => new AppError(404, msg, "NOT_FOUND");
export const conflict = (msg = "Data konflik") => new AppError(409, msg, "CONFLICT");
