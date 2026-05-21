import { useState, useEffect } from "react";

// --- DATA ---
const MOVIES = [
  { id: 1, title: "Inception", genre: ["Sci-Fi", "Thriller"], rating: 8.8, year: 2010, director: "Nolan", tags: ["mind-bending", "heist", "dreams"] },
  { id: 2, title: "The Dark Knight", genre: ["Action", "Thriller"], rating: 9.0, year: 2008, director: "Nolan", tags: ["superhero", "crime", "justice"] },
  { id: 3, title: "Interstellar", genre: ["Sci-Fi", "Drama"], rating: 8.6, year: 2014, director: "Nolan", tags: ["space", "time", "love"] },
  { id: 4, title: "The Matrix", genre: ["Sci-Fi", "Action"], rating: 8.7, year: 1999, director: "Wachowski", tags: ["virtual reality", "dystopia", "rebellion"] },
  { id: 5, title: "Parasite", genre: ["Thriller", "Drama"], rating: 8.6, year: 2019, director: "Bong", tags: ["class", "social", "dark comedy"] },
  { id: 6, title: "Spirited Away", genre: ["Animation", "Fantasy"], rating: 8.6, year: 2001, director: "Miyazaki", tags: ["fantasy", "spirit", "coming-of-age"] },
  { id: 7, title: "The Godfather", genre: ["Crime", "Drama"], rating: 9.2, year: 1972, director: "Coppola", tags: ["mafia", "family", "power"] },
  { id: 8, title: "Pulp Fiction", genre: ["Crime", "Drama"], rating: 8.9, year: 1994, director: "Tarantino", tags: ["nonlinear", "crime", "cult"] },
  { id: 9, title: "Avengers: Endgame", genre: ["Action", "Sci-Fi"], rating: 8.4, year: 2019, director: "Russo", tags: ["superhero", "time travel", "epic"] },
  { id: 10, title: "Your Name", genre: ["Animation", "Romance"], rating: 8.4, year: 2016, director: "Shinkai", tags: ["romance", "time", "identity"] },
  { id: 11, title: "Get Out", genre: ["Horror", "Thriller"], rating: 7.7, year: 2017, director: "Peele", tags: ["race", "social horror", "twist"] },
  { id: 12, title: "Mad Max: Fury Road", genre: ["Action", "Sci-Fi"], rating: 8.1, year: 2015, director: "Miller", tags: ["post-apocalyptic", "survival", "chaos"] },
  { id: 13, title: "La La Land", genre: ["Romance", "Drama"], rating: 8.0, year: 2016, director: "Chazelle", tags: ["music", "dreams", "nostalgia"] },
  { id: 14, title: "Princess Mononoke", genre: ["Animation", "Fantasy"], rating: 8.4, year: 1997, director: "Miyazaki", tags: ["nature", "war", "fantasy"] },
  { id: 15, title: "Blade Runner 2049", genre: ["Sci-Fi", "Drama"], rating: 8.0, year: 2017, director: "Villeneuve", tags: ["dystopia", "identity", "future"] },
];

// --- RECOMMENDATION ENGINE ---
// Content-based filtering using cosine similarity on feature vectors
function buildFeatureVector(movie, allGenres, allTags) {
  const genreVec = allGenres.map(g => movie.genre.includes(g) ? 1 : 0);
  const tagVec = allTags.map(t => movie.tags.includes(t) ? 1 : 0);
  const ratingNorm = (movie.rating - 7) / 2.2; // normalize 7–9.2 to ~0–1
  const yearNorm = (movie.year - 1970) / 55;
  return [...genreVec, ...tagVec, ratingNorm, yearNorm];
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

function getRecommendations(likedIds, allMovies) {
  if (!likedIds.length) return [];
  const allGenres = [...new Set(allMovies.flatMap(m => m.genre))];
  const allTags = [...new Set(allMovies.flatMap(m => m.tags))];
  const vectors = Object.fromEntries(allMovies.map(m => [m.id, buildFeatureVector(m, allGenres, allTags)]));

  const likedVectors = likedIds.map(id => vectors[id]);
  const avgVector = likedVectors[0].map((_, i) =>
    likedVectors.reduce((sum, v) => sum + v[i], 0) / likedVectors.length
  );

  return allMovies
    .filter(m => !likedIds.includes(m.id))
    .map(m => ({ ...m, score: cosineSimilarity(avgVector, vectors[m.id]) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// --- GENRE COLORS ---
const GENRE_COLOR = {
  "Sci-Fi": "#00f0ff", "Thriller": "#ff6b35", "Drama": "#a78bfa",
  "Action": "#fbbf24", "Crime": "#f87171", "Animation": "#34d399",
  "Fantasy": "#c084fc", "Horror": "#fb923c", "Romance": "#f472b6",
};

// --- COMPONENTS ---
function StarRating({ rating }) {
  const stars = Math.round(rating / 2);
  return (
    <span style={{ color: "#fbbf24", fontSize: "0.75rem", letterSpacing: "1px" }}>
      {"★".repeat(stars)}{"☆".repeat(5 - stars)}
      <span style={{ color: "#94a3b8", marginLeft: 4, fontSize: "0.7rem" }}>{rating}</span>
    </span>
  );
}

function MovieCard({ movie, liked, onToggle, showScore }) {
  const isLiked = liked.includes(movie.id);
  return (
    <div
      onClick={() => onToggle(movie.id)}
      style={{
        background: isLiked
          ? "linear-gradient(135deg, #1e3a5f 0%, #0f2847 100%)"
          : "linear-gradient(135deg, #1a1f2e 0%, #111827 100%)",
        border: isLiked ? "1.5px solid #38bdf8" : "1.5px solid #1f2d40",
        borderRadius: 14,
        padding: "1rem 1.1rem",
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
        transform: isLiked ? "scale(1.03)" : "scale(1)",
        boxShadow: isLiked ? "0 0 18px #38bdf840" : "0 2px 8px #0006",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isLiked && (
        <div style={{
          position: "absolute", top: 8, right: 10,
          background: "#38bdf8", borderRadius: "50%",
          width: 22, height: 22, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#0f172a"
        }}>✓</div>
      )}
      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1rem", color: "#f1f5f9", marginBottom: 4 }}>
        {movie.title}
      </div>
      <div style={{ marginBottom: 6 }}>
        <StarRating rating={movie.rating} />
        <span style={{ color: "#64748b", fontSize: "0.7rem", marginLeft: 8 }}>{movie.year}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
        {movie.genre.map(g => (
          <span key={g} style={{
            background: (GENRE_COLOR[g] || "#94a3b8") + "22",
            color: GENRE_COLOR[g] || "#94a3b8",
            border: `1px solid ${GENRE_COLOR[g] || "#94a3b8"}55`,
            borderRadius: 6, padding: "1px 7px", fontSize: "0.65rem", fontWeight: 600
          }}>{g}</span>
        ))}
      </div>
      {showScore && (
        <div style={{
          marginTop: 6, background: "#0f2847", borderRadius: 8,
          padding: "3px 10px", display: "inline-block"
        }}>
          <span style={{ color: "#38bdf8", fontSize: "0.7rem", fontWeight: 700 }}>
            Match: {Math.round(movie.score * 100)}%
          </span>
          <div style={{
            marginTop: 3, height: 4, background: "#1e3a5f", borderRadius: 4, width: 100
          }}>
            <div style={{
              height: "100%", borderRadius: 4, width: `${movie.score * 100}%`,
              background: "linear-gradient(90deg, #38bdf8, #818cf8)"
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

// --- MAIN APP ---
export default function RecommendationSystem() {
  const [liked, setLiked] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [tab, setTab] = useState("browse");
  const [filter, setFilter] = useState("All");

  const allGenres = ["All", ...new Set(MOVIES.flatMap(m => m.genre))];

  useEffect(() => {
    if (liked.length > 0) {
      setRecommendations(getRecommendations(liked, MOVIES));
    } else {
      setRecommendations([]);
    }
  }, [liked]);

  const toggleLike = (id) => {
    setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filtered = filter === "All" ? MOVIES : MOVIES.filter(m => m.genre.includes(filter));

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #060d1a 0%, #0a1628 50%, #060d1a 100%)",
      fontFamily: "'DM Sans', sans-serif",
      color: "#f1f5f9",
      padding: "0 0 3rem",
    }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: "2.5rem 2rem 1.5rem",
        borderBottom: "1px solid #1e293b",
        background: "linear-gradient(180deg, #0a1628 0%, transparent 100%)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #38bdf8, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 700
            }}>🎬</div>
            <div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.6rem", fontWeight: 900,
                margin: 0, letterSpacing: "-0.5px",
                background: "linear-gradient(90deg, #f1f5f9, #94a3b8)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>CineMatch</h1>
              <p style={{ margin: 0, color: "#475569", fontSize: "0.75rem" }}>
                Content-Based Filtering · Cosine Similarity
              </p>
            </div>
          </div>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: 10 }}>
            A simple ML recommendation system. ❤️ like movies you enjoy → get personalized recommendations.
          </p>

          {/* Algorithm callout */}
          <div style={{
            background: "#0f2847", border: "1px solid #1e3a5f",
            borderRadius: 10, padding: "0.6rem 1rem",
            marginTop: 12, display: "flex", gap: 20, flexWrap: "wrap"
          }}>
            {[
              ["Algorithm", "Content-Based Filtering"],
              ["Similarity", "Cosine Similarity"],
              ["Features", "Genre + Tags + Rating + Year"],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ color: "#38bdf8", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{k}</div>
                <div style={{ color: "#cbd5e1", fontSize: "0.75rem", fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 900, margin: "1.5rem auto 0", padding: "0 2rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["browse", "recommendations"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "0.45rem 1.2rem", borderRadius: 8, border: "none",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600, fontSize: "0.82rem", transition: "all 0.2s",
              background: tab === t ? "linear-gradient(135deg, #38bdf8, #818cf8)" : "#1e293b",
              color: tab === t ? "#0f172a" : "#94a3b8",
            }}>
              {t === "browse" ? `🎬 Browse (${liked.length} liked)` : `✨ Recommendations (${recommendations.length})`}
            </button>
          ))}
        </div>

        {tab === "browse" && (
          <>
            {/* Genre Filter */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {allGenres.map(g => (
                <button key={g} onClick={() => setFilter(g)} style={{
                  padding: "3px 12px", borderRadius: 20, border: "1px solid",
                  borderColor: filter === g ? (GENRE_COLOR[g] || "#38bdf8") : "#1f2d40",
                  background: filter === g ? (GENRE_COLOR[g] || "#38bdf8") + "22" : "transparent",
                  color: filter === g ? (GENRE_COLOR[g] || "#38bdf8") : "#64748b",
                  cursor: "pointer", fontSize: "0.72rem", fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
                }}>{g}</button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
              {filtered.map(m => (
                <MovieCard key={m.id} movie={m} liked={liked} onToggle={toggleLike} showScore={false} />
              ))}
            </div>
          </>
        )}

        {tab === "recommendations" && (
          <>
            {liked.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "4rem 2rem",
                color: "#475569", border: "1px dashed #1e293b",
                borderRadius: 16
              }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎯</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "#64748b" }}>
                  Like some movies first
                </div>
                <div style={{ fontSize: "0.8rem", marginTop: 4 }}>Go to Browse and ❤️ at least one movie</div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16, color: "#64748b", fontSize: "0.8rem" }}>
                  Based on <strong style={{ color: "#38bdf8" }}>{liked.length}</strong> liked movie(s) · Sorted by cosine similarity score
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 12 }}>
                  {recommendations.map(m => (
                    <MovieCard key={m.id} movie={m} liked={liked} onToggle={toggleLike} showScore={true} />
                  ))}
                </div>

                {/* How it works */}
                <div style={{
                  marginTop: 28, background: "#0f2847", border: "1px solid #1e3a5f",
                  borderRadius: 14, padding: "1.2rem 1.5rem"
                }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: 10, color: "#cbd5e1" }}>
                    🧠 How it works
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {[
                      ["1. Feature Extraction", "Each movie is encoded as a vector: genre flags, tag flags, normalized rating & year."],
                      ["2. User Profile", `Your ${liked.length} liked movie vectors are averaged into a single preference vector.`],
                      ["3. Cosine Similarity", "Dot product similarity between your profile vector and every unwatched movie's vector."],
                      ["4. Ranking", "Top 5 most similar movies are returned as recommendations."],
                    ].map(([title, desc]) => (
                      <div key={title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{
                          color: "#38bdf8", fontSize: "0.7rem", fontWeight: 700,
                          minWidth: 130, paddingTop: 1
                        }}>{title}</div>
                        <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
