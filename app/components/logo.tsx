import { FC } from "react";
import { Link } from "remix";
import { CalendarIcon } from "@heroicons/react/outline";
import clsx from "clsx";

interface Props {
  textColor?: string;
  withText?: boolean;
}

const Logo: FC<Props> = ({ textColor = "text-gray-900", withText = true }) => {
  return (
    <Link
      to="/"
      className={clsx(textColor, "flex title-font font-medium items-center")}
    >
      <CalendarIcon className="h-6 w-6" />
      {withText ? <span className="ml-3 text-xl">Calenduo</span> : null}
    </Link>
  );
};

export default Logo;
