'use client';

import { useEffect, useState } from "react";
import { searchAll } from "../api/search";
import useDebounce from "./useDebounce";

export function useSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({ people: [], images: [], blogs: [] });
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query, 300);

  useEffect(() => {
    if (!debounced) {
      setResults({ people: [], images: [], blogs: [] });
      return;
    }
    setLoading(true);
    searchAll(debounced)
      .then(setResults)
      .finally(() => setLoading(false));
  }, [debounced]);

  return { query, setQuery, results, loading };
}
