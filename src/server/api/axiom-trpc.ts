import { experimental_standaloneMiddleware } from "@trpc/server";
import { Logger, type RequestReport } from "next-axiom";
import { type NextRequest } from "next/server";

export type axiomTRPCMiddlewareCtx = {
  axiomReq: Request | NextRequest;
  axiomCtx: Record<string, unknown>;
};

export const axiomTRPCMiddleware = experimental_standaloneMiddleware<{
  ctx: axiomTRPCMiddlewareCtx;
}>().create((opts) => {
  const { axiomReq: req } = opts.ctx;

  let region = "";
  if ("geo" in req) {
    region = req.geo?.region ?? "";
  }

  const report: RequestReport = {
    startTime: new Date().getTime(),
    path: req.url,
    method: req.method,
    host: req.headers.get("host"),
    userAgent: req.headers.get("user-agent"),
    scheme: "https",
    ip: req.headers.get("x-forwarded-for"),
    region,
  };

  const log = new Logger({
    args: {
      input: opts.rawInput, // TODO: put something if nullish?
      ctx: opts.ctx.axiomCtx,
    },
    req: report,
  });

  return opts.next({
    ctx: { log },
  });
});
