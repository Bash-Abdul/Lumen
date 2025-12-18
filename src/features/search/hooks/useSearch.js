'use client';

import { useEffect, useState } from "react";
// import { searchAll } from "../api/search";
// import useDebounce from "./useDebounce";
import useDebounce from "@/shared/hooks/useDebounce";

const EMPTY_RESULTS = { people: [], images: [], blogs: [] };

export function useSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({ people: [], images: [], blogs: [] });
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query, 300);

  useEffect(() => {

    const q = debounced.trim();

    if (!q) {
      setResults(EMPTY_RESULTS);
      return;
    }

    let cancelled = false

    async function runSearch(){
      setLoading(true);
      try {
        const params = new URLSearchParams({ query: q });
        const res = await fetch(`/api/search?${params.toString()}`);

        if (!res.ok) {
          throw new Error(`Search failed with status ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) {
          setResults(data.results || EMPTY_RESULTS);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Search error", err);
          setResults(EMPTY_RESULTS);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }


    runSearch();

    return () => {
      cancelled = true;
    };
    // if (!debounced) {
    //   setResults({ people: [], images: [], blogs: [] });
    //   return;
    // }
    // setLoading(true);
    // searchAll(debounced)
    //   .then(setResults)
    //   .finally(() => setLoading(false));
  }, [debounced]);

  return { query, setQuery, results, loading };
}
