import { useEffect, useState } from "react";

/** CSS 미디어 쿼리 결과를 상태로. 같은 요소를 두 번 그리지 않고 폭에 따라 하나만 그릴 때 쓴다. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    setMatches(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
