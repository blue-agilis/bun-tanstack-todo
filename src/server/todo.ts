import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

import { connectDB } from "@/db";
import { Todo as TodoModel } from "@/models/Todo";

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
    await connectDB();
    const userId = await requireAuth();

    const todos = await TodoModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return todos.map((todo) => ({
      id: todo._id.toString(),
      title: todo.title,
      completed: todo.completed,
      userId: todo.userId,
      createdAt: todo.createdAt,
    }));
  },
);

export const createTodoFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ title: z.string().min(1).max(500) }))
  .handler(async ({ data }) => {
    await connectDB();
    const userId = await requireAuth();

    const todo = await TodoModel.create({
      title: data.title,
      userId,
    });

    return {
      id: todo._id.toString(),
      title: todo.title,
      completed: todo.completed,
      userId: todo.userId,
      createdAt: todo.createdAt,
    };
  });

export const toggleTodoCompleteFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await connectDB();
    const userId = await requireAuth();

    const existing = await TodoModel.findOne({ _id: data.id, userId });

    if (!existing) {
      throw new Error("Todo not found");
    }

    existing.completed = !existing.completed;
    await existing.save();

    return {
      id: existing._id.toString(),
      title: existing.title,
      completed: existing.completed,
      userId: existing.userId,
      createdAt: existing.createdAt,
    };
  });

export const deleteTodoFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await connectDB();
    const userId = await requireAuth();

    const existing = await TodoModel.findOneAndDelete({ _id: data.id, userId });

    if (!existing) {
      throw new Error("Todo not found");
    }

    return { id: data.id };
  });
