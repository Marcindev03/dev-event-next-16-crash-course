import { events } from "@/api/events";
import { ExploreButton } from "@/components/ExploreButton";
import { EventCard } from "@/components/EventCard";

const Page = () => {
  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev Event You Mustn't Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences - All in One Place
      </p>
      <ExploreButton />
      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <div className="events">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Page;
