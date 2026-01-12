import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  return (
    <header>
      <nav>
        <Link href={ROUTES.HOME} className="logo">
          <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
          <p>DevEvent</p>
        </Link>
        <ul className="list-none">
          <li>
            <Link href={ROUTES.HOME}>Home</Link>
          </li>
          <li>
            <Link href={ROUTES.EVENTS}>Events</Link>
          </li>
          <li>
            <Link href={ROUTES.CREATE_EVENT}>Create Event</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};
