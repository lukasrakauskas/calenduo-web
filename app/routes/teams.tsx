import { NavLink, Outlet, useLoaderData } from "remix";
import type { LoaderFunction } from "remix";
import { User } from "~/api";
import { requireUser } from "~/utils/session.server";
import Footer from "~/components/footer";
import Header from "~/components/header";
import clsx from "clsx";

type LoaderData = {
  user: User;
};

const navigations: Array<{ label: string; path: string }> = [
  { label: "Create a team", path: "new" },
  { label: "Invites", path: "invites" },
];

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  const data: LoaderData = {
    user,
  };

  return data;
};

export default function Teams() {
  const { user } = useLoaderData<LoaderData>() ?? {};

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <div className="flex flex-1 max-w-7xl sm:w-full mx-auto px-2 sm:px-6 lg:px-8 my-4">
        <div className="w-full">
          <div className="py-3 grid grid-cols-4 gap-x-4">
            <Outlet />
            <aside className="grid-col-1 self-start">
              <div className="shadow w-full rounded-md bg-white focus:outline-none">
                {navigations.map(({ label, path }) => (
                  <NavItem key={path} path={path} label={label} />
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
function NavItem({ path, label }: { path: string; label: string }) {
  return (
    <div className="py-1">
      <NavLink
        to={path}
        className={({ isActive }) =>
          clsx(
            isActive ? "bg-gray-100 text-gray-900" : "text-gray-700",
            "hover:bg-gray-200 hover:text-gray-900 block px-4 py-2 text-sm text-gray-700"
          )
        }
      >
        {label}
      </NavLink>
    </div>
  );
}
