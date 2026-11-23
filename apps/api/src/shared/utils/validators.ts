import { z } from "zod";

export const idParam = z.object({ id: z.coerce.number().int().positive() });
export const stringIdParam = z.object({ id: z.string().trim().min(1).max(50) });
export const optionalBool = z
  .enum(["true", "false"])
  .transform((v) => v === "true")
  .optional();
export const intId = z.coerce.number().int().positive();
