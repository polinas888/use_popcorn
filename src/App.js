import React, { Children, useEffect, useState } from "react";
import StarRating from "./StarRating";
import useMovie from "./useMovie";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "6a7f8b70";

export default function App() {
  const [watched, setWatched] = useState([]);
  const [query, setQuery] = useState("");
  const [movieId, setMovieId] = useState(null);
  const { movies, isLoading, error } = useMovie(query);

  useEffect(() => {
    const watched = JSON.parse(localStorage.getItem("watched"));
    if (!watched) return;
    setWatched(watched);
  }, []);

  function handleFindMovie(movie) {
    setQuery(movie);
  }

  function handleSelectMovie(id) {
    setMovieId(id);
  }

  function handleClearMovieDetails() {
    setMovieId(null);
  }

  function handleAddWatchedMovie(movie) {
    setWatched((watched) => [...watched, movie]);
    localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  function onDeleteWatched(movieId) {
    const watchedMovies = watched.filter((movie) => movie.imdbID !== movieId);
    setWatched(watchedMovies);
    localStorage.setItem("watched", JSON.stringify(watchedMovies));
    handleClearMovieDetails();
  }

  return (
    <>
      <Navigation>
        <Search query={query} findMovie={handleFindMovie} />
        <NumResult movies={movies} />
      </Navigation>
      <Main>
        <MoviesBox>
          {!isLoading && !error ? (
            <ChoosedMovieList movies={movies} selectMovie={handleSelectMovie} />
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <p>Loading...</p>
          )}
        </MoviesBox>
        <MoviesBox>
          {movieId ? (
            <MovieDetails
              movieId={movieId}
              clearMovieDetails={handleClearMovieDetails}
              addWatchedMovie={handleAddWatchedMovie}
              watched={watched}
              onDeleteWatched={onDeleteWatched}
            />
          ) : (
            <>
              <WatchedMoviesSummery watched={watched} />
              <WatchedMovieList watched={watched} />
            </>
          )}
        </MoviesBox>
      </Main>
    </>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function WatchedMovieList({ watched }) {
  return (
    <ul className="list list-movies">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.rating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({
  movieId,
  clearMovieDetails,
  addWatchedMovie,
  watched,
  onDeleteWatched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState("");
  const [isRated, setIsRated] = useState(false);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  useEffect(() => {
    async function fetchMovie(movieId) {
      setError("");
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://www.omdbapi.com/?i=${movieId}&apikey=${KEY}`
        );
        console.log(response);
        if (!response.ok) throw Error("Something went wrong fetching the data");

        const jsonData = await response.json();

        setMovie(jsonData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovie(movieId);
  }, [movieId]);

  useEffect(() => {
    const isWatched = watched.some((movie) => movie.imdbID === movieId);
    setIsRated(isWatched);
  }, [watched, movieId]);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: movieId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      rating,
    };

    addWatchedMovie(newWatchedMovie);
    clearMovieDetails();
  }

  const handleStarRate = (index) => {
    setRating(index + 1);
  };

  return (
    <div className="details">
      {!isLoading && !error ? (
        <>
          <header>
            <button className="btn-back" onClick={clearMovieDetails}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>

          <section>
            {isRated ? (
              <p>This movie is already in your watched list.</p>
            ) : (
              <>
                <StarRating rating={rating} handleStarRate={handleStarRate} />
                {rating && (
                  <button className="btn-add" onClick={handleAdd}>
                    + Add to list
                  </button>
                )}
              </>
            )}
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
            {isRated && (
              <button
                className="btn-delete"
                onClick={() => onDeleteWatched(movie.imdbID)}
              >
                X
              </button>
            )}
          </section>
        </>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

function WatchedMoviesSummery({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.rating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function MoviesBox({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function ChoosedMovieList({ movies, selectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <ChoosedMovie
          movie={movie}
          key={movie.imdbID}
          selectMovie={selectMovie}
        />
      ))}
    </ul>
  );
}

function ChoosedMovie({ movie, selectMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => selectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Navigation({ children }) {
  return (
    <nav className="nav-bar">
      <NavigationLogo />
      {children}
    </nav>
  );
}

function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function NavigationLogo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, findMovie }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => findMovie(e.target.value)}
    />
  );
}
