/** Pengguna yang sedang login (diisi oleh authenticate middleware). */
export type Actor = NonNullable<Express.Request["user"]>;
