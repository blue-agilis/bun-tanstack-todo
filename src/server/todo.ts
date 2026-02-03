import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

import { prisma } from "@/db";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
}

async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export const getTodosFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await requireAuth();

    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return todos;
  },
);

export const createTodoFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ title: z.string().min(1).max(500) }))
  .handler(async ({ data }) => {
    const userId = await requireAuth();

    const todo = await prisma.todo.create({
      data: {
        title: data.title,
        userId,
      },
    });

    return todo;
  });

export const toggleTodoCompleteFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const userId = await requireAuth();

    const existing = await prisma.todo.findFirst({
      where: { id: data.id, userId },
    });

    if (!existing) {
      throw new Error("Todo not found");
    }

    const todo = await prisma.todo.update({
      where: { id: data.id },
      data: { completed: !existing.completed },
    });

    return todo;
  });

export const deleteTodoFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const userId = await requireAuth();

    const existing = await prisma.todo.findFirst({
      where: { id: data.id, userId },
    });

    if (!existing) {
      throw new Error("Todo not found");
    }

    await prisma.todo.delete({
      where: { id: data.id },
    });

    return { id: data.id };
  });
