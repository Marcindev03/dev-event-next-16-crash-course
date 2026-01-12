import { ROUTES } from "@/constants/routes";
import { EventData } from "@/types/event";
import Image from "next/image";
import Link from "next/link";

type EventCardProps = Omit<EventData, "id">;

export const EventCard = ({
  title,
  image,
  slug,
  location,
  date,
  time,
}: EventCardProps) => {
  return (
    <Link href={ROUTES.EVENTS} id="event-card">
      <Image
        src={image}
        alt={title}
        width={410}
        height={300}
        className="poster"
      />

      <div className="flex flex-row gap-2">
        <Image src="/icons/pin.svg" alt="pin" width={14} height={14} />
        <p>{location}</p>
      </div>
      <p className="title">{title}</p>
      <div className="datetime">
        <Image src="/icons/calendar.svg" alt="date" width={14} height={14} />
        <p>{date}</p>
        <Image src="/icons/clock.svg" alt="time" width={14} height={14} />
        <p>{time}</p>
      </div>
    </Link>
  );
};
