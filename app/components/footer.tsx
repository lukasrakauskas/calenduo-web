import Logo from "./logo";

export default function Footer() {
  return (
    <footer className="text-gray-600 body-font max-w-7xl sm:w-full mx-auto px-2 sm:px-6 lg:px-8 mb-4">
      <div className="flex items-center sm:items-start sm:flex-row flex-col">
        <Logo />
        <p className="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">
          © 2021 Calenduo - All rights reserved
        </p>
      </div>
    </footer>
  );
}
