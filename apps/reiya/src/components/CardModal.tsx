import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaArrowUp,
  FaBookmark,
  FaCheck,
  FaCircleCheck,
  FaEllipsis,
  FaHeart,
  FaShare,
  FaXmark,
} from "react-icons/fa6";
import { Image } from "@unpic/react";
import type { FC } from "react";
import type { CardData } from "./Card";

interface CardModalProps {
  card: CardData;
  onClose: () => void;
}

export const CardModal: FC<CardModalProps> = ({ card, onClose }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const handleScroll = () => {
    if (imageContainerRef.current) {
      const { scrollTop } = imageContainerRef.current;
      setShowScrollTop(scrollTop > 200);
    }
  };

  const scrollToTop = () => {
    if (imageContainerRef.current) {
      imageContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return createPortal(
    <dialog className="modal modal-open">
      <div className="modal-box flex max-h-[90vh] w-11/12 max-w-6xl flex-col overflow-hidden rounded-3xl bg-white p-0 shadow-2xl md:flex-row">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 z-20 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur transition-colors hover:bg-white"
        >
          <FaXmark className="h-5 w-5" />
        </button>

        <div className="absolute top-4 right-4 z-20 flex gap-2 md:hidden">
          <button
            type="button"
            className="rounded-full bg-white/80 p-2 shadow-sm backdrop-blur transition-colors hover:bg-white"
          >
            <FaBookmark className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-full bg-white/80 p-2 shadow-sm backdrop-blur transition-colors hover:bg-white"
          >
            <FaEllipsis className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={imageContainerRef}
          onScroll={handleScroll}
          className="scrollbar-hide relative flex h-[40vh] w-full flex-col overflow-y-auto bg-gray-100 md:h-auto md:w-[60%]"
        >
          <div className="flex flex-col gap-4 p-4 md:p-8">
            {card.images.map((img) => (
              <div
                key={img.src}
                className="relative w-full overflow-hidden rounded-xl bg-white shadow-sm"
              >
                <Image
                  src={img.src}
                  width={img.width}
                  height={img.height}
                  alt={card.title}
                  layout="constrained"
                  className="h-auto w-full object-contain"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className={`hover:text-primary absolute right-6 bottom-6 z-30 transform rounded-full bg-white p-3 text-gray-700 shadow-lg transition-all duration-300 ${
              showScrollTop
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-10 opacity-0"
            }`}
          >
            <FaArrowUp className="h-5 w-5" />
          </button>
        </div>

        <div className="z-10 flex h-[60vh] w-full flex-col overflow-hidden bg-white shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.1)] md:h-auto md:w-[40%]">
          <div className="sticky top-0 z-10 hidden justify-end gap-2 p-4 md:flex">
            <button
              type="button"
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <FaBookmark className="h-5 w-5 text-gray-600" />
            </button>
            <button
              type="button"
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <FaEllipsis className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pt-2 pb-8 md:px-8">
            <div className="text-sm text-gray-500">Illustration</div>

            <div className="flex flex-col gap-2">
              <h2 className="text-3xl leading-tight font-bold text-gray-900">
                {card.title}
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-500">From</span>
                <span className="text-2xl font-bold text-gray-900">
                  €{20 + (String(card.id).length % 80)}.00
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FaCheck className="text-gray-900" /> Personal
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <FaXmark className="text-gray-400" /> Monetized content
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <FaXmark className="text-gray-400" /> Commercial merchandising
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <Image
                src={card.artist.avatar.src}
                width={48}
                height={48}
                alt={card.artist.name}
                layout="constrained"
                className="h-12 w-12 rounded-full ring-2 ring-white"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 font-bold text-gray-900">
                  <span className="truncate">{card.artist.name}</span>
                  {card.artist.verified && (
                    <FaCircleCheck className="text-primary h-3 w-3 shrink-0" />
                  )}
                </div>
                <div className="truncate text-sm text-gray-500">
                  @{card.artist.name.replace(/\s/g, "").toLowerCase()}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
              Thanks for considering me for your commission! Please only start a
              request if you find the service details and my Terms of Service
              acceptable.
            </div>

            <div className="border-b border-gray-200">
              <div className="flex gap-6">
                <button
                  type="button"
                  className="border-b-2 border-black pb-3 text-sm font-semibold"
                >
                  Description
                </button>
                <button
                  type="button"
                  className="border-b-2 border-transparent pb-3 text-sm font-medium text-gray-500 hover:text-gray-800"
                >
                  Reviews ({card.reviewCount})
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-sm leading-relaxed text-gray-600">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
              <ul className="flex list-disc flex-col gap-1 pl-4">
                <li>High quality resolution (300dpi)</li>
                <li>Full color with simple background</li>
                <li>Commercial use available as add-on</li>
              </ul>
            </div>
          </div>

          <div className="sticky bottom-0 mt-auto border-t border-gray-100 bg-white p-4">
            <div className="flex gap-3">
              <button
                type="button"
                className="btn btn-primary shadow-primary/30 hover:shadow-primary/40 flex-1 transform rounded-full font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Request this style
              </button>
              <button
                type="button"
                className="btn btn-circle btn-ghost border border-gray-200 hover:bg-gray-50"
              >
                <FaHeart className="h-5 w-5 text-gray-400" />
              </button>
              <button
                type="button"
                className="btn btn-circle btn-ghost border border-gray-200 hover:bg-gray-50"
              >
                <FaShare className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>,
    document.body,
  );
};
