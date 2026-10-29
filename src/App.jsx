
import { useEffect, useState } from "react";
import "./App.css";

const destinations = [
  { id: 1, name: "Manali", state: "Himachal Pradesh", price: 8500, days: 4, category: "Mountains", emoji: "🏔️", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80" },
  { id: 2, name: "Jaipur", state: "Rajasthan", price: 6000, days: 3, category: "Heritage", emoji: "🏰", image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=900&q=80" },
  { id: 3, name: "Goa", state: "Goa", price: 10000, days: 4, category: "Beach", emoji: "🏖️", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80" },
  { id: 4, name: "Udaipur", state: "Rajasthan", price: 7500, days: 3, category: "Heritage", emoji: "🛶", image: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=900&q=80" },
  { id: 5, name: "Kashmir", state: "Jammu & Kashmir", price: 14000, days: 5, category: "Mountains", emoji: "❄️", image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=900&q=80" },
  { id: 6, name: "Kerala", state: "Kerala", price: 11000, days: 5, category: "Nature", emoji: "🌴", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80" },
  { id: 7, name: "Shimla", state: "Himachal Pradesh", price: 7000, days: 3, category: "Mountains", emoji: "🌲", image: "https://images.unsplash.com/photo- हिम?auto=format&fit=crop&w=900&q=80".replace("photo- हिम", "photo-1500530855697-b586d89ba3ee") },
  { id: 8, name: "Agra", state: "Uttar Pradesh", price: 4500, days: 2, category: "Heritage", emoji: "🕌", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80" }
];

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [users, setUsers] = useState(() => readStorage("tripmate_users", []));
  const [currentUser, setCurrentUser] = useState(() => readStorage("tripmate_session", null));
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState("Explore");
  const [favorites, setFavorites] = useState([]);
  const [trips, setTrips] = useState([]);
  const [tripForm, setTripForm] = useState({ destination: "Manali", date: "", people: "2", budget: "" });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem("tripmate_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("tripmate_session", JSON.stringify(currentUser));
    if (currentUser) {
      setFavorites(readStorage(`tripmate_favorites_${currentUser.email}`, []));
      setTrips(readStorage(`tripmate_trips_${currentUser.email}`, []));
    } else {
      setFavorites([]);
      setTrips([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`tripmate_favorites_${currentUser.email}`, JSON.stringify(favorites));
    }
  }, [favorites, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`tripmate_trips_${currentUser.email}`, JSON.stringify(trips));
    }
  }, [trips, currentUser]);

  function updateAuth(field, value) {
    setAuthForm((previous) => ({ ...previous, [field]: value }));
  }

  function handleAuth(event) {
    event.preventDefault();
    setAuthError("");
    const email = authForm.email.trim().toLowerCase();

    if (!email || !authForm.password) {
      setAuthError("Please enter your email and password.");
      return;
    }

    if (authMode === "signup") {
      if (!authForm.name.trim()) {
        setAuthError("Please enter your full name.");
        return;
      }
      if (authForm.password.length < 6) {
        setAuthError("Password must be at least 6 characters.");
        return;
      }
      if (users.some((user) => user.email === email)) {
        setAuthError("This email already has an account. Please log in.");
        return;
      }

      const newUser = {
        id: `TM${Date.now().toString().slice(-7)}`,
        name: authForm.name.trim(),
        email,
        password: authForm.password
      };
      setUsers((previous) => [...previous, newUser]);
      setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });
      setAuthForm({ name: "", email: "", password: "" });
      return;
    }

    const matchedUser = users.find(
      (user) => user.email === email && user.password === authForm.password
    );

    if (!matchedUser) {
      setAuthError("Incorrect email or password. Try again or create an account.");
      return;
    }

    setCurrentUser({
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email
    });
    setAuthForm({ name: "", email: "", password: "" });
  }

  function logout() {
    setCurrentUser(null);
    setPage("Explore");
    setAuthMode("login");
    setNotice("");
  }

  function toggleFavorite(id) {
    setFavorites((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  function createTrip(event) {
    event.preventDefault();
    const destination = destinations.find((item) => item.name === tripForm.destination);
    const people = Math.max(1, Number(tripForm.people) || 1);
    const budget = Number(tripForm.budget) || destination.price * people;

    const newTrip = {
      id: Date.now(),
      destination: destination.name,
      date: tripForm.date,
      people,
      budget,
      days: destination.days,
      createdAt: new Date().toLocaleDateString()
    };

    setTrips((previous) => [newTrip, ...previous]);
    setNotice(`Your ${destination.name} trip has been saved!`);
    setPage("My Trips");
  }

  const visibleDestinations = destinations.filter((destination) => {
    const matchesSearch = `${destination.name} ${destination.state}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = category === "All" || destination.category === category;
    const matchesFavorites = page !== "Favorites" || favorites.includes(destination.id);
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  if (!currentUser) {
    return (
      <main className="auth-page">
        <div className="auth-decoration auth-decoration-one" />
        <div className="auth-decoration auth-decoration-two" />
        <section className="auth-card">
          <div className="brand auth-brand"><span className="brand-icon">✈</span> TripMate</div>
          <p className="eyebrow">YOUR NEXT ADVENTURE STARTS HERE</p>
          <h1>{authMode === "login" ? "Welcome back!" : "Create your account"}</h1>
          <p className="auth-subtitle">
            {authMode === "login"
              ? "Log in to discover places and manage your trips."
              : "Join TripMate and start planning memorable journeys."}
          </p>

          <form className="auth-form" onSubmit={handleAuth}>
            {authMode === "signup" && (
              <label>
                Full name
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={authForm.name}
                  onChange={(event) => updateAuth("name", event.target.value)}
                  required
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                placeholder="you@example.com"
                value={authForm.email}
                onChange={(event) => updateAuth("email", event.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                placeholder="At least 6 characters"
                value={authForm.password}
                onChange={(event) => updateAuth("password", event.target.value)}
                minLength={6}
                required
              />
            </label>
            {authError && <p className="error-message">{authError}</p>}
            <button className="primary-button full-button" type="submit">
              {authMode === "login" ? "Log In →" : "Create Account →"}
            </button>
          </form>

          <p className="auth-switch">
            {authMode === "login" ? "New to TripMate?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setAuthMode(authMode === "login" ? "signup" : "login");
                setAuthError("");
              }}
            >
              {authMode === "login" ? "Create account" : "Log in"}
            </button>
          </p>
          <p className="demo-note">Demo version · Account details are stored in this browser only.</p>
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={() => setPage("Explore")}>
          <span className="brand-icon">✈</span> TripMate
        </a>
        <p className="sidebar-label">WORKSPACE</p>
        {[
          ["Explore", "⌕"],
          ["Plan a Trip", "＋"],
          ["My Trips", "▤"],
          ["Favorites", "♡"],
          ["My Profile", "♙"]
        ].map(([label, icon]) => (
          <button
            key={label}
            className={`nav-item ${page === label ? "active" : ""}`}
            onClick={() => {
              setPage(label);
              setNotice("");
            }}
          >
            <span>{icon}</span> {label}
            {label === "My Trips" && trips.length > 0 && (
              <span className="nav-count">{trips.length}</span>
            )}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="mini-profile">
            <div className="avatar">{currentUser.name.charAt(0).toUpperCase()}</div>
            <div className="mini-profile-text">
              <strong>{currentUser.name}</strong>
              <span>TripMate member</span>
            </div>
          </div>
          <button className="nav-item logout-button" onClick={logout}>
            <span>↪</span> Log out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="topbar-greeting">YOUR PERSONAL TRAVEL PLANNER</span>
            <p>Hey, {currentUser.name.split(" ")[0]}! <span>✦</span></p>
          </div>
          <div className="topbar-user">
            <span className="status-dot" />
            <span>You're all set to explore</span>
            <div className="avatar">{currentUser.name.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        {notice && (
          <div className="success-message">
            <span>✓</span> {notice}
            <button onClick={() => setNotice("")}>×</button>
          </div>
        )}

        {page === "Explore" && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="hero-tag">✦ FIND YOUR HAPPY PLACE</span>
                <h1>Collect moments,<br />not just <span>miles.</span></h1>
                <p>Discover beautiful destinations and plan your next unforgettable escape.</p>
                <button className="hero-button" onClick={() => setPage("Plan a Trip")}>
                  Plan your trip <span>↗</span>
                </button>
              </div>
              <div className="hero-art" aria-hidden="true">
                <span className="hero-sun" />
                <span className="hero-mountain mountain-back" />
                <span className="hero-mountain mountain-front" />
                <span className="hero-plane">✈</span>
                <span className="hero-cloud cloud-one">☁</span>
                <span className="hero-cloud cloud-two">☁</span>
              </div>
            </section>

            <section className="stats-grid">
              <div className="stat-card"><span>🌍</span><div><strong>08</strong><small>Destinations</small></div></div>
              <div className="stat-card"><span>🧳</span><div><strong>{trips.length.toString().padStart(2, "0")}</strong><small>My planned trips</small></div></div>
              <div className="stat-card"><span>💙</span><div><strong>{favorites.length.toString().padStart(2, "0")}</strong><small>Saved favorites</small></div></div>
            </section>

            <DestinationSection
              destinations={visibleDestinations}
              search={search}
              setSearch={setSearch}
              category={category}
              setCategory={setCategory}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onPlan={() => setPage("Plan a Trip")}
            />
          </>
        )}

        {page === "Favorites" && (
          <>
            <PageHeading title="Your favorites" subtitle="The places you've saved for later." />
            <DestinationSection
              destinations={visibleDestinations}
              search={search}
              setSearch={setSearch}
              category={category}
              setCategory={setCategory}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onPlan={() => setPage("Plan a Trip")}
            />
            {visibleDestinations.length === 0 && <EmptyState text="No favorites yet. Explore destinations and tap the heart to save one." />}
          </>
        )}

        {page === "Plan a Trip" && (
          <section className="content-panel">
            <PageHeading title="Plan your next trip" subtitle="Choose a destination and create your own travel plan." />
            <form className="trip-form" onSubmit={createTrip}>
              <label>Destination
                <select value={tripForm.destination} onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}>
                  {destinations.map((destination) => <option key={destination.id}>{destination.name}</option>)}
                </select>
              </label>
              <label>Departure date
                <input type="date" value={tripForm.date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setTripForm({ ...tripForm, date: e.target.value })} required />
              </label>
              <label>Number of travellers
                <input type="number" min="1" max="30" value={tripForm.people} onChange={(e) => setTripForm({ ...tripForm, people: e.target.value })} required />
              </label>
              <label>Your total budget (₹)
                <input type="number" min="1" placeholder="e.g. 15000" value={tripForm.budget} onChange={(e) => setTripForm({ ...tripForm, budget: e.target.value })} />
              </label>
              <div className="budget-hint">
                <span>💡</span>
                <div><strong>Budget tip</strong><p>Estimated starting cost: ₹{(destinations.find((d) => d.name === tripForm.destination)?.price || 0).toLocaleString("en-IN")} per person.</p></div>
              </div>
              <button className="primary-button" type="submit">Save my trip →</button>
            </form>
          </section>
        )}

        {page === "My Trips" && (
          <section className="content-panel">
            <PageHeading title="My trips" subtitle="All your planned adventures in one place." />
            {trips.length === 0 ? <EmptyState text="You haven't planned a trip yet." action="Plan a trip" onAction={() => setPage("Plan a Trip")} /> : (
              <div className="trip-list">
                {trips.map((trip) => (
                  <article className="trip-row" key={trip.id}>
                    <div className="trip-emoji">{destinations.find((d) => d.name === trip.destination)?.emoji || "🧳"}</div>
                    <div className="trip-info"><h3>{trip.destination}</h3><p>{trip.date} · {trip.people} traveller(s) · {trip.days} days</p><span>Saved on {trip.createdAt}</span></div>
                    <strong className="trip-price">₹{trip.budget.toLocaleString("en-IN")}</strong>
                    <button className="delete-button" title="Delete trip" onClick={() => setTrips((previous) => previous.filter((item) => item.id !== trip.id))}>×</button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {page === "My Profile" && (
          <section className="content-panel profile-panel">
            <PageHeading title="My profile" subtitle="Your TripMate account details." />
            <div className="profile-avatar">{currentUser.name.charAt(0).toUpperCase()}</div>
            <h2>{currentUser.name}</h2>
            <p className="profile-email">{currentUser.email}</p>
            <div className="profile-id"><span>YOUR TRIPMATE ID</span><strong>{currentUser.id}</strong></div>
            <div className="profile-summary">
              <div><strong>{trips.length}</strong><span>Trips planned</span></div>
              <div><strong>{favorites.length}</strong><span>Favorites</span></div>
            </div>
            <button className="primary-button" onClick={logout}>Log out</button>
          </section>
        )}

        <footer className="footer">Made for curious minds and open roads <span>♥</span> TripMate</footer>
      </main>
    </div>
  );
}

function PageHeading({ title, subtitle }) {
  return <div className="page-heading"><h1>{title}</h1><p>{subtitle}</p></div>;
}

function EmptyState({ text, action, onAction }) {
  return <div className="empty-state"><span>🧭</span><p>{text}</p>{action && <button className="primary-button" onClick={onAction}>{action}</button>}</div>;
}

function DestinationSection({ destinations, search, setSearch, category, setCategory, favorites, toggleFavorite, onPlan }) {
  return (
    <section className="destinations-section">
      <div className="section-heading">
        <div><span className="eyebrow">MADE FOR YOUR WANDERLUST</span><h2>Explore destinations</h2><p>Find a place that feels like you.</p></div>
      </div>
      <div className="destination-controls">
        <input className="search-input" placeholder="⌕  Search places..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="category-tabs">
          {["All", "Mountains", "Beach", "Heritage", "Nature"].map((item) => (
            <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>
      </div>
      {destinations.length === 0 ? <EmptyState text="No destinations found. Try another search." /> : (
        <div className="destination-grid">
          {destinations.map((destination) => (
            <article className="destination-card" key={destination.id}>
              <div className="destination-image" style={{ backgroundImage: `url("${destination.image}")` }}>
                <span className="destination-category">{destination.category}</span>
                <button className={`favorite-button ${favorites.includes(destination.id) ? "favorited" : ""}`} onClick={() => toggleFavorite(destination.id)} aria-label="Toggle favorite">
                  {favorites.includes(destination.id) ? "♥" : "♡"}
                </button>
              </div>
              <div className="destination-details">
                <div className="destination-title"><h3>{destination.name}</h3><span>{destination.emoji}</span></div>
                <p className="destination-state">⌖ {destination.state}</p>
                <div className="destination-bottom"><div><small>Starting from</small><strong>₹{destination.price.toLocaleString("en-IN")}</strong></div><span>◷ {destination.days} days</span></div>
                <button className="card-plan-button" onClick={onPlan}>Plan this trip <span>→</span></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}