import type { MetaFunction, LoaderFunction } from 'remix';
import { useLoaderData, json } from 'remix';
import { User } from '~/api';
import Footer from '~/components/footer';
import Header from '~/components/header';
import { getUser } from '~/utils/session.server';

export let meta: MetaFunction = () => {
  return {
    title: 'Calenduo',
    description: 'Welcome to Calenduo!',
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

export default function Index() {
  const { user } = useLoaderData<IndexData>();

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <div className="flex flex-1 mx-auto my-4 px-2 max-w-7xl sm:px-6 sm:w-full lg:px-8">
        <main>
          <h2>Welcome to Calenduo!</h2>
          <p>We're stoked that you're here. 🥳</p>
        </main>
      </div>
      <Footer />
    </div>
  );
}
