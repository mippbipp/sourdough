import { Link } from "@tanstack/react-router";

const links = [
  { to: "/", label: "Home" },
  { to: "/todos", label: "Todos" },
  // /lab is dev only (see routes/lab.tsx)
  ...(import.meta.env.DEV ? ([{ to: "/lab", label: "Lab" }] as const) : []),
] as const;

export default function Header() {
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => (
            <Link key={to} to={to}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <hr />
    </div>
  );
}
