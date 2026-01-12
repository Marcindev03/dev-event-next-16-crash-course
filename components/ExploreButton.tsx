"use client";

import Image from "next/image";

type ExploreButtonProps = {
  onClick?: () => void;
};

// TODO: CTAButton component
export const ExploreButton = ({ onClick }: ExploreButtonProps) => {
  return (
    <button
      type="button"
      id="explore-btn"
      className="mt-7 mx-auto"
      onClick={onClick}
    >
      <a href="#events">Explore Events</a>
      <Image
        className="ml-2"
        src={"/icons/arrow-down.svg"}
        alt="arrow-down"
        width={24}
        height={24}
      />
    </button>
  );
};
