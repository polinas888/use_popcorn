import React, { Children, useEffect, useState } from "react";

const KEY = "6a7f8b70";

export default function useMovie(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMovies() {
      setError("");
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://www.omdbapi.com/?s=${query}&apikey=${KEY}`
        );
        if (!response.ok) throw Error("Something went wrong fetching the data");

        const jsonData = await response.json();
        if (jsonData.Response === "False") throw Error("No such movies");

        setMovies(jsonData.Search);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (!query.length) {
      setMovies([]);
      setError("");
      return;
    }

    fetchMovies();
  }, [query]);

  return { movies, isLoading, error };
}
