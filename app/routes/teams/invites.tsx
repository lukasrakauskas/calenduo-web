import { json, useLoaderData } from "remix";
import type { LoaderFunction, MetaFunction } from "remix";
import { api, User } from "~/api";
import type { Team } from "~/api";
import { requireAccessToken, requireUser } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return {
    title: "Invites to teams | Calenduo",
    description: "Your invites on Calenduo",
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
        <h1 className="text-3xl font-bold text-gray-900">Invites</h1>
      </div>
    </>
  );
}
