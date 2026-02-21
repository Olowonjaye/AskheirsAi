declare global {
  // allow attaching prisma to global in dev to preserve a singleton
  // eslint-disable-next-line no-var
  var prisma: any | undefined;
}

let prismaClient: any;
try {
  // require at runtime so build doesn't fail if client hasn't been generated yet
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require("@prisma/client");
  prismaClient = global.prisma || new PrismaClient();
  if (process.env.NODE_ENV !== "production") global.prisma = prismaClient;
} catch (e) {
  // If @prisma/client isn't available (e.g., not generated), provide a noop
  // proxy so imports don't crash during build. Runtime calls will fail if
  // actually invoked, which surfaces the need to run `prisma generate`.
  prismaClient = new Proxy({}, { get: () => () => { throw new Error("Prisma client not generated. Run `npx prisma generate`. "); } });
}

export const prisma = prismaClient;
