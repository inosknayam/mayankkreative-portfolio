import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorized() {
  return err("Unauthorized – please log in.", 401);
}

export function forbidden() {
  return err("Forbidden – insufficient permissions.", 403);
}

export function notFound(entity = "Resource") {
  return err(`${entity} not found.`, 404);
}

export function validationError(e: ZodError) {
  const message = e.errors.map((x) => x.message).join("; ");
  return err(message, 422);
}

export function serverError(e: unknown) {
  console.error(e);
  return err("An unexpected server error occurred.", 500);
}
