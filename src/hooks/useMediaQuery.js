import { useEffect, useState } from "react";

export function useMediaQuery(query) {
  const getMatches = (query) => {
    if (typeof window === "undefined") {
      return false; // SSR safety
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatches(query));

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);

    const handleChange = (event) => {
      setMatches(event.matches);
    };

    // Set initial value (important if query changes)
    setMatches(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}