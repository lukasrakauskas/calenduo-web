import type { MetaFunction, LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import { User } from "~/api";
import Footer from "~/components/footer";
import Header from "~/components/header";
import { getUser } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return {
    title: "Dashboard | Calenduo",
  };
};

type IndexData = {
  user: User | null;
};

export let loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  const data: IndexData = {
    user,
  };

  return data;
};

export default function Dashboard() {
  const { user } = useLoaderData<IndexData>();

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <div className="flex flex-1 max-w-7xl sm:w-full mx-auto px-2 sm:px-6 lg:px-8 my-4">
        <main>
          <h2>Welcome to Calenduo!</h2>
          <p>We're stoked that you're here. 🥳</p>
        </main>
      </div>
      <Footer />
    </div>
  );
}
