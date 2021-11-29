import { json, Link, useLoaderData } from "remix";
import type { LoaderFunction, MetaFunction } from "remix";
import { api, User } from "~/api";
import type { Team } from "~/api";
import { requireAccessToken, requireUser } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return {
    title: "Teams | Calenduo",
    description: "View your teams in Calenduo",
  };
};

type TeamsData = {
  user: User;
  teams: Team[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const accessToken = await requireAccessToken(request);
  const user = await requireUser(request);

  try {
    const { data: teams } = await api.teams.findAllTeams({
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return json({ teams, user });
  } catch (error) {
    return { teams: [], user };
  }
};

export default function Teams() {
  const { teams, user } = useLoaderData<TeamsData>();

  return (
    <>
      <div className="max-w-7xl pb-6 col-span-3">
        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
      </div>
      <main className="col-span-3">
        <div className="shadow overflow-hidden sm:rounded-lg bg-white">
          {teams.length === 0 ? (
            <p className="p-6 text-gray-900">
              You don't have any teams yet.{" "}
              <Link to="new" className="text-indigo-600 hover:underline">
                Create one
              </Link>
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-200">
                {teams.map((team) => (
                  <TeamTableItem team={team} user={user} key={team.id} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}

function TeamTableItem({ team, user }: { team: Team; user: User }) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded-full"
              src="https://placekitten.com/100/100"
              alt=""
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{team.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-4">
          {user.id === team.ownerId ? (
            <Link
              to={`${team.id}`}
              className="text-indigo-600 hover:text-indigo-900"
            >
              Settings
            </Link>
          ) : (
            <a href="#" className="text-red-600 hover:text-red-900">
              Leave
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}
