import { sql } from "bun";

try {
	await sql`
		CREATE TABLE IF NOT EXISTS todos (
			id SERIAL PRIMARY KEY,
			title TEXT NOT NULL,
			completed BOOLEAN NOT NULL DEFAULT false,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`;

	await sql`DELETE FROM todos`;

	const sampleTodos = [
		{ title: "Learn Bun", completed: true },
		{ title: "Build a todo app", completed: true },
		{ title: "Deploy to production", completed: false },
	];

	for (const todo of sampleTodos) {
		await sql`INSERT INTO todos (title, completed) VALUES (${todo.title}, ${todo.completed})`;
	}

	const todos = await sql`SELECT * FROM todos ORDER BY id DESC`;

	console.log(`✅ Seeded ${todos.length} todos into the database`);
	console.log(`Current todos:`, todos);
} catch (error) {
	console.error("❌ Error seeding database:", error);
	if (error instanceof Error) {
		console.error("Error message:", error.message);
	}
	process.exit(1);
} finally {
	await sql.close();
}
