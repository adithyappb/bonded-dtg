import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function installErrorHandler(app: {
  setErrorHandler: (handler: (error: Error, request: FastifyRequest, reply: FastifyReply) => void) => void;
}): void {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      void reply.status(400).send({
        error: {
          code: "validation_error",
          message: "Request validation failed.",
          details: error.flatten()
        }
      });
      return;
    }

    if (error instanceof ApiError) {
      void reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      });
      return;
    }

    void reply.status(500).send({
      error: {
        code: "internal_error",
        message: error.message || "Unexpected backend error."
      }
    });
  });
}

