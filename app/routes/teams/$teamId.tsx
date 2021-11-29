import {
  Link,
  useTransition,
  Form,
  redirect,
  useActionData,
  json,
  useCatch,
  useParams,
  useLoaderData,
} from "remix";
import type {
  MetaFunction,
  LoaderFunction,
  HeadersFunction,
  ActionFunction,
} from "remix";
import { useRef, useState } from "react";
import { api, Team } from "~/api";
import {
  getAccessToken,
  requireAccessToken,
  requireUser,
} from "~/utils/session.server";
import clsx from "clsx";
import { getException } from "~/utils/exception.server";
import Modal from "~/components/modal";

export let meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  if (!data) {
    return {
      title: "No team",
      description: "No team found",
    };
  }
  return {
    title: `${data.team.name} settings`,
    description: `Customise ${data.team.name} settings`,
  };
};

type LoaderData = { team: Team; isOwner: boolean };

export const loader: LoaderFunction = async ({ request, params }) => {
  const accessToken = await getAccessToken(request);
  const user = await requireUser(request);
  const teamId = Number(params.teamId ?? -1);

  try {
    const { data: team } = await api.teams.findTeamById(teamId, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data: LoaderData = { team, isOwner: user.id === team.ownerId };
    return json(data, {
      headers: {
        "Cache-Control": `public, max-age=${60 * 5}, s-maxage=${60 * 60 * 24}`,
        Vary: "Cookie",
      },
    });
  } catch (error) {
    const exception = getException(error);

    if ([404, 401].includes(exception.statusCode)) {
      throw new Response(exception.message, { status: exception.statusCode });
    }

    throw error;
  }
};

export let headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    "Cache-Control": loaderHeaders.get("Cache-Control") ?? "",
    Vary: loaderHeaders.get("Vary") ?? "",
  };
};

export let action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();

  if (formData.get("_method") === "delete") {
    const accessToken = await requireAccessToken(request);
    const teamId = Number(params.teamId ?? -1);

    try {
      await api.teams.deleteTeam(teamId, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return redirect(`/teams`);
    } catch (error) {
      const exception = getException(error);

      if ([404, 403, 401].includes(exception.statusCode)) {
        throw new Response(exception.message, { status: exception.statusCode });
      }

      throw error;
    }
  }

  return null;
};

export default function Team() {
  const { team, isOwner } = useLoaderData<LoaderData>() ?? {};
  const errors = useActionData();
  const transition = useTransition();

  const deleteFormRef = useRef<HTMLFormElement>(null);
  const [slug, setSlug] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="max-w-7xl pb-6 col-span-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {team?.name} settings
        </h1>
      </div>
      <div className="col-span-3">
        <Form method="delete">
          <div className="shadow border sm:rounded-md sm:overflow-hidden">
            <div className=" px-4 py-5 bg-white space-y-6 sm:p-6">
              <div className="">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                  placeholder="Your team name"
                />
                {errors?.name ? (
                  <p className="mt-2 text-sm text-red-500">{errors.name}</p>
                ) : null}
              </div>

              <div className="">
                <label
                  htmlFor="slug"
                  className={clsx(
                    errors?.slug && "text-red-700",
                    "block text-sm font-medium text-gray-700"
                  )}
                >
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  className={clsx(
                    errors?.slug && "border-red-500",
                    "mt-1 focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                  )}
                  placeholder="Your team slug"
                  onChange={(e) => setSlug(e.target.value)}
                  autoComplete="off"
                />
                {errors?.slug ? (
                  <p className="mt-2 text-sm text-red-500">{errors.slug}</p>
                ) : null}
                {!!slug ? (
                  <p className="mt-2 text-sm text-gray-500">
                    http://calenduo.com/teams/{slug.toLowerCase()}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="about"
                  className="block text-sm font-medium text-gray-700"
                >
                  About
                </label>
                <div className="mt-1">
                  <textarea
                    id="about"
                    name="about"
                    rows={3}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="you@example.com"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Brief description for your profile. URLs are hyperlinked.
                </p>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 sm:px-6 flex justify-end gap-x-2">
              <Link
                to="/teams"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={!!transition.submission}
              >
                {transition.submission ? "Update..." : "Update team"}
              </button>
            </div>
          </div>
        </Form>
        {isOwner ? (
          <>
            <div className="max-w-7xl py-5 col-span-3">
              <h2 className="text-2xl font-bold text-red-900">Danger zone</h2>
            </div>
            <Form method="delete" ref={deleteFormRef}>
              <input type="hidden" name="_method" value="delete" />
              <div className="shadow border border-red-500 sm:rounded-md sm:overflow-hidden bg-white">
                <div className="p-4 sm:px-6 flex justify-between gap-x-2">
                  <div className="">
                    <div className="text-sm font-medium text-gray-900">
                      Delete this team
                    </div>
                    <div className="text-sm text-gray-500">
                      Once deleted, it will be gone forever. Please be certain.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Delete team
                  </button>
                </div>
              </div>
            </Form>
          </>
        ) : null}
      </div>
      <Modal
        open={isModalOpen}
        onSubmit={() => {
          deleteFormRef.current?.submit();
        }}
        onCancel={() => setIsModalOpen(false)}
        title={`Delete team ${team?.name}`}
        content={
          <>
            <p>Are you sure you want to delete this team?</p>
            <p>This action cannot be undone.</p>
          </>
        }
        submitLabel={transition.submission ? "Deleting..." : "Delete team"}
        disabled={!!transition.submission}
      />
    </>
  );
}

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
