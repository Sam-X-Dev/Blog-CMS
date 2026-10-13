import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import type { ApiResponse } from "@/types/api";

export function ok<T>(data: T, message = "Success", status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function fail<T = never>(
  message: string,
  status = 400,
  errors?: Record<string, string[] | undefined>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(errors ? { errors } : {}),
    },
    { status }
  );
}

export function handleApiError(error: unknown, entity = "Item"): NextResponse<ApiResponse<never>> {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return fail(`${entity} already exists`, 409);
    }
    if (error.code === "P2025") {
      return fail(`${entity} not found`, 404);
    }
  }

  console.error(`[API Error] [${entity}]`, error);
  return fail("Something went wrong. Please try again.", 500);
}
