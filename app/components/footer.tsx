import Logo from './logo';

export default function Footer() {
  return (
    <footer className="body-font mb-4 mx-auto px-2 max-w-7xl text-gray-600 sm:px-6 sm:w-full lg:px-8">
      <div className="flex flex-col items-center sm:flex-row sm:items-start">
        <Logo />
        <p className="mt-4 text-gray-500 text-sm sm:ml-4 sm:mt-0 sm:pl-4 sm:py-2 sm:border-l-2 sm:border-gray-200">
          © 2021 Calenduo - All rights reserved
        </p>
      </div>
    </footer>
  );
}
