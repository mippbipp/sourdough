import { Link } from "@tanstack/react-router";

const links = [
  { label: "Home", to: "/" },
  { label: "Todos", to: "/todos" },
  // /lab is dev only (see routes/lab.tsx)
  ...(import.meta.env.DEV ? ([{ label: "Lab", to: "/lab" }] as const) : []),
] as const;

export default function Header() {
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ label, to }) => (
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
