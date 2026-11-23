import { prisma } from "../config/database.js";
import { forbidden, unauthorized } from "../shared/errors/app-error.js";
import { asyncHandler } from "../shared/utils/async-handler.js";
import { verifyToken, type TokenPayload } from "../shared/utils/jwt.js";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw unauthorized("Token tidak ditemukan");

  let payload: TokenPayload;
  try {
    payload = verifyToken(header.slice(7));
  } catch {
    throw unauthorized("Token tidak valid atau sudah kedaluwarsa");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, username: true, name: true, role: true, status: true },
  });
  if (!user) throw unauthorized("Akun tidak ditemukan");
  if (user.status !== "Aktif") throw forbidden("Akun Anda nonaktif");

  req.user = { id: user.id, username: user.username, name: user.name, role: user.role };
  next();
});
