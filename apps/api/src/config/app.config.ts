export const appConfig = {
  name: "API Bank Sampah Kampus",
  apiPrefix: "/api",
  ids: {
    sampahPrefix: "SMP",
    penukaranPrefix: "TKR",
    startNumber: 1000, // ID pertama => SMP-1001 / TKR-1001
  },
  jsonLimit: "1mb",
} as const;
