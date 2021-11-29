import { Link, useTransition, Form, redirect, useActionData } from "remix";
import type { MetaFunction, ActionFunction } from "remix";
import { useState } from "react";
import invariant from "tiny-invariant";
import { api } from "~/api";
import { requireAccessToken } from "~/utils/session.server";
import clsx from "clsx";
import { getException } from "~/utils/exception.server";

export const meta: MetaFunction = () => {
  return {
    title: "Create a team | Calenduo",
    description: "Create a team on Calenduo",
  };
};

type FormData = {
  name: string;
  slug: string;
};

export const action: ActionFunction = async ({ request }) => {
  const accessToken = await requireAccessToken(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const slug = formData.get("slug");

  const errors: Partial<FormData> = {};
  if (!name) errors.name = "Name is required";
  if (!slug) errors.slug = "Slug is required";

  if (Object.keys(errors).length) {
    return errors;
  }

  invariant(typeof name === "string");
  invariant(typeof slug === "string");

  try {
    await api.teams.createTeam(
      { name, slug },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return redirect("/teams");
  } catch (error) {
    const exception = getException(error);

    // TODO: handle errors better in api
    if ([400, 409].includes(exception.statusCode)) {
      return { slug: exception.message };
    }

    throw error;
  }
};

export default function CreateTeam() {
  const errors = useActionData<Partial<FormData>>();
  const transition = useTransition();
  const [slug, setSlug] = useState("");

  return (
    <>
      <div className="max-w-7xl pb-6 col-span-4">
        <h1 className="text-3xl font-bold text-gray-900">Create a team</h1>
      </div>
      <div className="col-span-3">
        <Form method="post">
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
                {transition.submission ? "Creating..." : "Create team"}
              </button>
            </div>
          </div>
        </Form>
      </div>
    </>
  );
}
