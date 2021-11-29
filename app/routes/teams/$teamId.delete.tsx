import { ActionFunction, useCatch, useParams } from "remix";
import { redirect } from "remix";
import { api } from "~/api";
import { getException } from "~/utils/exception.server";
import { requireAccessToken } from "~/utils/session.server";

export const action: ActionFunction = async ({ request, params }) => {
  const accessToken = await requireAccessToken(request);
  const teamId = Number(params.teamId ?? -1);

  try {
    await api.teams.deleteTeam(teamId, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return redirect("/teams");
  } catch (error) {
    const exception = getException(error);

    if ([404, 401, 403].includes(exception.statusCode)) {
      throw new Response(exception.message, { status: exception.statusCode });
    }

    throw error;
  }
};

export function CatchBoundary() {
  let caught = useCatch();
  let params = useParams();
  switch (caught.status) {
    case 404: {
      return (
        <div className="error-container">
          Huh? What the heck is {params.teamId}?
        </div>
      );
    }
    case 401: {
      return (
        <div className="error-container">
          Sorry, but {params.teamId} is not your joke.
        </div>
      );
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  const { teamId } = useParams();
  return (
    <div>{`There was an error loading joke by the id ${teamId}. Sorry.`}</div>
  );
}
