import type { CardData } from "../lib/api-client";
import { Image } from "@unpic/react";
import {
  ArrowUp,
  Bookmark,
  Check,
  CheckCircle,
  Ellipsis,
  Heart,
  Share,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface CardModalProps {
  card: CardData;
  onClose: () => void;
}

const RE_WHITESPACE = /\s/g;

export function CardModal({ card, onClose }: CardModalProps) {
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
    <dialog className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
      <div className="bg-body flex max-h-[90vh] w-11/12 max-w-6xl flex-col overflow-hidden rounded-3xl p-0 shadow-2xl md:flex-row">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 z-20 rounded-full bg-body/80 p-2 shadow-sm backdrop-blur transition-colors hover:bg-surface"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="absolute top-4 right-4 z-20 flex gap-2 md:hidden">
          <button
            type="button"
            className="rounded-full bg-body/80 p-2 shadow-sm backdrop-blur transition-colors hover:bg-surface"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-full bg-body/80 p-2 shadow-sm backdrop-blur transition-colors hover:bg-surface"
          >
            <Ellipsis className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={imageContainerRef}
          onScroll={handleScroll}
          className="scrollbar-hide relative flex h-[40vh] w-full flex-col overflow-y-auto bg-surface md:h-auto md:w-[60%]"
        >
          <div className="flex flex-col gap-4 p-4 md:p-8">
            {card.images.map((img) => (
              <div
                key={img.src}
                className="relative w-full overflow-hidden rounded-xl bg-body shadow-sm"
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
            className={`hover:text-accent absolute right-6 bottom-6 z-30 transform rounded-full bg-body p-3 text-secondary shadow-lg transition-all duration-300 ${
              showScrollTop
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-10 opacity-0"
            }`}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>

        <div className="z-10 flex h-[60vh] w-full flex-col overflow-hidden bg-body shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.1)] md:h-auto md:w-[40%]">
          <div className="sticky top-0 z-10 hidden justify-end gap-2 p-4 md:flex">
            <button
              type="button"
              className="rounded-full p-2 transition-colors hover:bg-surface"
            >
              <Bookmark className="h-5 w-5 text-secondary/80" />
            </button>
            <button
              type="button"
              className="rounded-full p-2 transition-colors hover:bg-surface"
            >
              <Ellipsis className="h-5 w-5 text-secondary/80" />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pt-2 pb-8 md:px-8">
            <div className="text-sm text-secondary/70">Illustration</div>

            <div className="flex flex-col gap-2">
              <h2 className="text-3xl leading-tight font-bold text-secondary">
                {card.title}
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-secondary/70">From</span>
                <span className="text-2xl font-bold text-secondary">
                  €{20 + (String(card.id).length % 80)}
                  .00
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-sm text-secondary/80">
              <div className="flex items-center gap-2">
                <Check className="text-secondary" /> Personal
              </div>
              <div className="flex items-center gap-2 text-secondary/50">
                <X className="text-secondary/50" /> Monetized content
              </div>
              <div className="flex items-center gap-2 text-secondary/50">
                <X className="text-secondary/50" /> Commercial merchandising
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
              <Image
                src={card.artist.avatar.src}
                width={48}
                height={48}
                alt={card.artist.name}
                layout="constrained"
                className="h-12 w-12 rounded-full ring-2 ring-body"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 font-bold text-secondary">
                  <span className="truncate">{card.artist.name}</span>
                  {card.artist.verified && (
                    <CheckCircle className="text-accent h-3 w-3 shrink-0" />
                  )}
                </div>
                <div className="truncate text-sm text-secondary/70">
                  @{card.artist.name.replace(RE_WHITESPACE, "").toLowerCase()}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-accent-muted p-4 text-sm leading-relaxed text-secondary">
              Thanks for considering me for your commission! Please only start a
              request if you find the service details and my Terms of Service
              acceptable.
            </div>

            <div className="border-b border-border">
              <div className="flex gap-6">
                <button
                  type="button"
                  className="border-b-2 border-border pb-3 text-sm font-semibold"
                >
                  Description
                </button>
                <button
                  type="button"
                  className="border-b-2 border-transparent pb-3 text-sm font-medium text-secondary/70 hover:text-secondary"
                >
                  Reviews ({card.reviewCount})
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-sm leading-relaxed text-secondary/80">
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

          <div className="sticky bottom-0 mt-auto border-t border-border bg-body p-4">
            <div className="flex gap-3">
              <button
                type="button"
                className="inline-flex items-center bg-accent text-on-accent font-medium shadow-primary/30 hover:shadow-primary/40 flex-1 transform rounded-full font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Request this style
              </button>
              <button
                type="button"
                className="hover:bg-surface inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors border border-border hover:bg-surface"
              >
                <Heart className="h-5 w-5 text-secondary/50" />
              </button>
              <button
                type="button"
                className="hover:bg-surface inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors border border-border hover:bg-surface"
              >
                <Share className="h-5 w-5 text-secondary/50" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" className="fixed inset-0 -z-10">
        <button type="submit" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>,
    document.body,
  );
}
