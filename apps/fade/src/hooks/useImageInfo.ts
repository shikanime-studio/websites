import { useAtom } from "@effect/atom-react";
import { imageElementAtom } from "../lib/ui-atoms";

export function useImageInfo() {
  const [image, setImage] = useAtom(imageElementAtom);
  return { image, setImage };
}
