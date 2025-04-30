import React, { useState, useEffect } from "react";
import "./ComicsSearch.css";

const BASE_URL = "https://openlibrary.org/search.json";

const ComicFinder = () => {
  const [comics, setComics] = useState([]);
  const [searchQuery, setSearchQuery] = useState("spider-man");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authors, setAuthors] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [comicType, setComicType] = useState("comics");

  const comicSubjects = [
    "comics",
    "graphic novels",
    "manga",
    "superheroes",
    "comic books",
    "comic strips",
  ];

  const fetchComics = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${BASE_URL}?q=${encodeURIComponent(searchQuery)}&subject=${encodeURIComponent(comicType)}&page=${page}`
      );
      const data = await res.json();

      const mapped = data.docs.map((item) => ({
        title: item.title,
        authors: item.author_name?.join(", ") || "Unknown",
        authorArray: item.author_name || [],
        date: item.first_publish_year || "N/A",
        coverId: item.cover_i,
      }));

      setAuthors([...new Set(mapped.flatMap((b) => b.authorArray))]);
      setYears([...new Set(mapped.map((b) => b.date).filter((y) => y !== "N/A"))]);
      setComics(mapped);
    } catch (err) {
      setError("Failed to fetch comics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComics();
  }, [page, sortOrder, comicType]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComics();
  };

  const filtered = comics.filter((comic) => {
    return (
      (selectedAuthor ? comic.authors.includes(selectedAuthor) : true) &&
      (selectedYear ? comic.date === selectedYear : true)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const compare = a.title.localeCompare(b.title);
    return sortOrder === "asc" ? compare : -compare;
  });

  return (
    <div className="container">
      <h1>🦸 Comic Finder</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search Comics (e.g. Spider-Man, Batman)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">Search</button>
        <button
          type="button"
          onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
        >
          Toggle Order ({sortOrder})
        </button>
      </form>

      <div className="filters">
        <select value={comicType} onChange={(e) => setComicType(e.target.value)}>
          {comicSubjects.map((subject, i) => (
            <option key={i} value={subject}>
              {subject.replace(/(^|\s)\S/g, (l) => l.toUpperCase())}
            </option>
          ))}
        </select>

        <select value={selectedAuthor} onChange={(e) => setSelectedAuthor(e.target.value)}>
          <option value="">All Authors</option>
          {authors.map((author, i) => (
            <option key={i} value={author}>
              {author}
            </option>
          ))}
        </select>

        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="">All Years</option>
          {years.sort().map((year, i) => (
            <option key={i} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading comics...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && sorted.length === 0 && <p>No comics found for this search.</p>}

      <div className="comic-grid">
        {sorted.map((comic, index) => (
          <div key={index} className="comic-card">
            {comic.coverId ? (
              <img
                src={`https://covers.openlibrary.org/b/id/${comic.coverId}-M.jpg`}
                alt={comic.title}
              />
            ) : (
              <div className="placeholder">No Cover</div>
            )}
            <h3>{comic.title}</h3>
            <p>{comic.authors}</p>
            <p><em>{comic.date}</em></p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
};

export default ComicFinder;
