import { convexQuery } from "@convex-dev/react-query";
import { api } from "@sourdough/backend/convex/_generated/api";
import type { Id } from "@sourdough/backend/convex/_generated/dataModel";
import { Button } from "@sourdough/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sourdough/ui/components/card";
import { Checkbox } from "@sourdough/ui/components/checkbox";
import { Input } from "@sourdough/ui/components/input";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import { useState, type SubmitEvent } from "react";

export const Route = createFileRoute("/todos")({
  component: TodosRoute,
});

function TodosRoute() {
  const [newTodoText, setNewTodoText] = useState("");

  const todosQuery = useSuspenseQuery(convexQuery(api.todos.getAll, {}));
  const todos = todosQuery.data;

  const createTodo = useMutation(api.todos.create);
  const toggleTodo = useMutation(api.todos.toggle);
  const removeTodo = useMutation(api.todos.deleteTodo);

  const handleAddTodo = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = newTodoText.trim();

    if (text !== "") {
      setNewTodoText("");

      try {
        await createTodo({ text });
      } catch {
        setNewTodoText(text);
      }
    }
  };

  const handleToggleTodo = async (id: Id<"todos">, completed: boolean) => {
    try {
      await toggleTodo({ id, completed: !completed });
    } catch {
      // Optimistic update not used; the next query refresh restores state.
    }
  };

  const handleDeleteTodo = async (id: Id<"todos">) => {
    try {
      await removeTodo({ id });
    } catch {
      // Deletion failed server-side; the next query refresh restores the item.
    }
  };

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Todo List (Convex)</CardTitle>
          <CardDescription>Manage your tasks efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              void handleAddTodo(e);
            }}
            className="mb-6 flex items-center space-x-2"
          >
            <Input
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Add a new task..."
            />
            <Button type="submit" disabled={newTodoText.trim() === ""}>
              Add
            </Button>
          </form>

          {todos?.length === 0 ? (
            <p className="py-4 text-center">No todos yet. Add one above!</p>
          ) : (
            <ul className="space-y-2">
              {todos?.map((todo) => (
                <li
                  key={todo._id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => {
                        void handleToggleTodo(todo._id, todo.completed);
                      }}
                      id={`todo-${todo._id}`}
                    />
                    <label
                      htmlFor={`todo-${todo._id}`}
                      className={
                        todo.completed
                          ? "text-muted-foreground line-through"
                          : ""
                      }
                    >
                      {todo.text}
                    </label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      void handleDeleteTodo(todo._id);
                    }}
                    aria-label="Delete todo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
