import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { createTodoFn, deleteTodoFn, getTodosFn, type Todo, toggleTodoCompleteFn } from "@/server/todo";

export const Route = createFileRoute("/")({
	component: App,
	loader: async () => getTodosFn(),
});

function App() {
	const getTodos = useServerFn(getTodosFn);
	const addTodo = useServerFn(createTodoFn);
	const toggleTodo = useServerFn(toggleTodoCompleteFn);
	const deleteTodo = useServerFn(deleteTodoFn);

	const initTodos = Route.useLoaderData();

	const {
		data: todos = [],
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["todos"],
		queryFn: () => getTodos(),
		initialData: initTodos,
	});

	const { mutate: mutateAddTodo } = useMutation({
		mutationFn: (title: string) => addTodo({ data: { title } }),
	});

	const { mutate: mutateToggleTodo } = useMutation({
		mutationFn: (id: number) => toggleTodo({ data: { id } }),
	});

	const { mutate: mutateDeleteTodo } = useMutation({
		mutationFn: (id: number) => deleteTodo({ data: { id } }),
	});

	const stats = useMemo(
		() => ({
			total: todos.length,
			pending: todos.filter((todo: Todo) => !todo.completed).length,
		}),
		[todos],
	);

	return (
		<main className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-md h-[85vh] min-h-[250px] flex flex-col border-2">
				<CardHeader className="shrink-0">
					<div className="flex items-center justify-center gap-4">
						<img src="/logo.svg" alt="Bun Logo" width={75} height={75} />
						<img src="/tanstack.png" alt="Tanstack Logo" width={65} height={65} />
					</div>
					<CardTitle className="text-center text-2xl font-bold">Bun + TanStack Todo</CardTitle>
					<CardDescription className="text-center">Keep track of your tasks</CardDescription>
				</CardHeader>

				<CardContent className="flex-1 min-h-0 flex flex-col space-y-4">
					<TodoForm onAddTodo={mutateAddTodo} />
					<Separator />

					<div className="flex items-center justify-between text-sm text-muted-foreground">
						{stats.total > 0 && (
							<>
								<span>
									{stats.total} {stats.total === 1 ? "task" : "tasks"}
								</span>
								<span>{stats.pending} remaining</span>
							</>
						)}
					</div>

					<div className="flex-1 min-h-0 overflow-y-auto space-y-2">
						{isLoading ? (
							<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading…</div>
						) : isError ? (
							<div className="flex items-center justify-center h-full text-muted-foreground text-sm">
								Could not load tasks
							</div>
						) : todos.length === 0 ? (
							<div className="flex items-center justify-center h-full text-muted-foreground">
								<div className="text-center">
									<p className="text-sm font-medium">No tasks yet</p>
									<p className="text-xs mt-1">Add one above to get started</p>
								</div>
							</div>
						) : (
							todos.map((todo: Todo) => (
								<TodoItem
									key={todo.id}
									todo={todo}
									handleToggleTodo={mutateToggleTodo}
									handleDeleteTodo={mutateDeleteTodo}
								/>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</main>
	);
}

function TodoForm({ onAddTodo }: { onAddTodo: (title: string) => void }) {
	const [todo, setTodo] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (todo.trim().length === 0) return;
		onAddTodo(todo);
		setTodo("");
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2 shrink-0">
			<Input
				value={todo}
				onChange={(e) => setTodo(e.target.value)}
				placeholder="Add a new task…"
				className="flex-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-pink-400"
			/>
			<Button type="submit" size="icon" disabled={todo.trim().length === 0}>
				<Plus className="h-4 w-4" />
			</Button>
		</form>
	);
}

function TodoItem({
	todo,
	handleToggleTodo,
	handleDeleteTodo,
}: {
	todo: Todo;
	handleToggleTodo: (id: number) => void;
	handleDeleteTodo: (id: number) => void;
}) {
	const checkboxId = `todo-${todo.id}`;

	return (
		<div className="group flex items-center gap-3 p-3 rounded-lg border bg-card transition-all duration-150 hover:bg-accent">
			<Checkbox
				className="cursor-pointer"
				id={checkboxId}
				checked={todo.completed}
				onCheckedChange={() => handleToggleTodo(todo.id)}
			/>
			<label
				htmlFor={checkboxId}
				className={`flex-1 text-sm ${todo.completed ? "text-muted-foreground line-through" : ""}`}
			>
				{todo.title}
			</label>
			<Button
				onClick={() => handleDeleteTodo(todo.id)}
				variant="ghost"
				size="icon"
				className="h-8 w-8 opacity-0 group-hover:opacity-100 cursor-pointer"
				aria-label="Delete todo"
			>
				<X className="h-4 w-4" />
			</Button>
		</div>
	);
}
