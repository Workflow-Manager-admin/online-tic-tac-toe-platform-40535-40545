import React, { useState, useEffect } from 'react';
import './App.css';
import {
  registerUser,
  loginUser,
  setToken,
  getToken,
  clearToken,
  startGame,
  getGame,
  makeMove,
  listMyGames,
  getScoreboard,
  getGameHistory,
} from './api';
import AuthForm from './components/AuthForm';
import GameBoard from './components/GameBoard';
import GameHistoryList from './components/GameHistoryList';
import ScoreboardList from './components/ScoreboardList';
import MoveHistoryTable from './components/MoveHistoryTable';

// PUBLIC_INTERFACE
function App() {
  // UI state
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null); // { username }
  const [view, setView] = useState('home'); // home, newgame, game, history, scoreboard
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Game state
  const [games, setGames] = useState([]);
  const [activeGame, setActiveGame] = useState(null); // full game object
  const [moveHistory, setMoveHistory] = useState([]);
  const [scoreboard, setScoreboard] = useState([]);
  // New Game form
  const [newGameOpponent, setNewGameOpponent] = useState('');
  const [asPlayer, setAsPlayer] = useState('X');

  // Theme side effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // On login, fetch games & scoreboard
  useEffect(() => {
    if (user && getToken()) {
      refreshGames();
      refreshScoreboard();
    }
  }, [user]);

  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  }

  // AUTH
  async function handleLogin(username, password) {
    setError('');
    setBusy(true);
    try {
      const res = await loginUser(username, password);
      setToken(res.access_token);
      setUser({ username });
      setView('home');
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleSignup(username, password) {
    setError('');
    setBusy(true);
    try {
      await registerUser(username, password);
      // log in immediately after signup
      await handleLogin(username, password);
    } catch (e) {
      setError(e.message || 'Signup failed');
      setBusy(false);
    }
  }

  function logout() {
    clearToken();
    setUser(null);
    setActiveGame(null);
    setView('home');
  }

  // GAME
  async function refreshGames() {
    setBusy(true);
    try {
      const games = await listMyGames();
      setGames(games.reverse()); // show most recent first
    } catch (e) {
      setError(e.message || 'Failed to load games');
    } finally {
      setBusy(false);
    }
  }

  async function refreshScoreboard() {
    try {
      const scoreboard = await getScoreboard();
      setScoreboard(scoreboard);
    } catch (e) {
      setScoreboard([]);
    }
  }

  async function createNewGame(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const g = await startGame({
        opponent: newGameOpponent.trim() || null,
        asPlayer,
      });
      setActiveGame(g);
      setView('game');
    } catch (e) {
      setError(e.message || 'Could not start game');
    } finally {
      setBusy(false);
    }
  }

  async function selectGame(gameId) {
    setBusy(true);
    setError('');
    try {
      const g = await getGame(gameId);
      setActiveGame(g);
      setMoveHistory([]);
      setView('game');
    } catch (e) {
      setError('Could not load game');
    } finally {
      setBusy(false);
    }
  }

  async function handleCellClick(x, y) {
    if (!activeGame || activeGame.status !== 'ongoing') return;
    setBusy(true);
    setError('');
    try {
      const updatedGame = await makeMove(activeGame.id, x, y);
      setActiveGame(updatedGame);
      setMoveHistory([]);
      refreshGames();
    } catch (e) {
      setError(e.message || 'Move failed');
    } finally {
      setBusy(false);
    }
  }

  async function viewHistory(game) {
    if (!game) return;
    setBusy(true);
    setError('');
    try {
      const moves = await getGameHistory(game.id);
      setMoveHistory(moves);
      setView('history');
    } catch {
      setMoveHistory([]);
      setError('Could not fetch history');
    } finally {
      setBusy(false);
    }
  }

  // Try auto re-login with token
  useEffect(() => {
    // Minimal: decode JWT to get username (no validation)
    function parseJwt(token) {
      if (!token) return null;
      try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (e) {
        return null;
      }
    }
    if (!user && getToken()) {
      const payload = parseJwt(getToken());
      if (payload && payload.sub) {
        setUser({ username: payload.sub });
      }
    }
    // If no token, ensure logged out
    if (!getToken()) setUser(null);
  }, []); // once

  // NAVIGATION
  function renderAppBar() {
    return (
      <nav className="topnav">
        <span className="nav-title" style={{ color: 'var(--primary-color)', fontWeight: 700 }}>
          T3 Online
        </span>
        {!!user && (
          <>
            <button className="btn" onClick={() => setView('home')} disabled={busy}>
              Games
            </button>
            <button className="btn" onClick={() => setView('scoreboard')} disabled={busy}>
              Scoreboard
            </button>
            <button className="btn" onClick={() => setView('newgame')} disabled={busy}>
              New Game
            </button>
            <span style={{ margin: '0 16px', color: 'var(--accent-color)' }}>
              {user.username}
            </span>
            <button className="btn-logout" onClick={logout} disabled={busy}>
              Log out
            </button>
          </>
        )}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </nav>
    );
  }

  function renderMain() {
    if (!user) {
      return (
        <div className="centerbox">
          <AuthForm onLogin={handleLogin} onSignup={handleSignup} loading={busy} error={error} />
        </div>
      );
    }

    if (view === 'scoreboard') {
      return (
        <div className="scoreboard-page">
          <ScoreboardList scores={scoreboard} currentUser={user.username} />
        </div>
      );
    }

    if (view === 'newgame') {
      return (
        <div className="centerbox">
          <form className="newgame-form" onSubmit={createNewGame}>
            <h2>Start New Game</h2>
            <label>
              Opponent username (blank = hotseat):
              <input
                className="auth-input"
                type="text"
                value={newGameOpponent}
                disabled={busy}
                onChange={e => setNewGameOpponent(e.target.value)}
                placeholder="Enter username or leave blank"
              />
            </label>
            <label>
              Play as:
              <select value={asPlayer} disabled={busy} onChange={e => setAsPlayer(e.target.value)}>
                <option value="X">X</option>
                <option value="O">O</option>
              </select>
            </label>
            <button
              className="btn btn-large"
              type="submit"
              style={{ background: 'var(--primary-color)', color: '#fff' }}
              disabled={busy}
            >
              Start Game
            </button>
            {error && <div className="error-msg" style={{ color: 'var(--accent-color)', marginTop: 8 }}>{error}</div>}
          </form>
        </div>
      );
    }

    if (view === 'game' && activeGame) {
      return (
        <div className="game-page">
          <GameBoard
            game={activeGame}
            disabled={busy}
            onCellClick={handleCellClick}
          />
          <div className="game-actions">
            <button className="btn" onClick={refreshGames} disabled={busy}>
              Refresh State
            </button>
            <button className="btn" onClick={() => setView('home')} disabled={busy}>
              Back to Games
            </button>
            <button className="btn" onClick={() => viewHistory(activeGame)} disabled={busy}>
              Move History
            </button>
          </div>
        </div>
      );
    }

    if (view === 'history' && activeGame) {
      return (
        <div className="centerbox">
          <h2>Move History (Game {activeGame.id.slice(-6)})</h2>
          <MoveHistoryTable moves={moveHistory.length ? moveHistory : activeGame.history} />
          <button className="btn" onClick={() => setView('game')}>Back to Game</button>
        </div>
      );
    }

    // Main game list view
    return (
      <div className="mainpage">
        <div className="main-topbar">
          <button className="btn btn-large" onClick={() => setView('newgame')} disabled={busy}>+ New Game</button>
          <button className="btn btn-large" onClick={refreshGames} disabled={busy}>Refresh</button>
          <button className="btn btn-large" onClick={() => setView('scoreboard')} disabled={busy}>🏆 Scoreboard</button>
        </div>
        <GameHistoryList games={games} onSelect={selectGame} />
        {!!error && <div className="error-msg" style={{ color: 'var(--accent-color)', margin: 16 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div className="App">
      {renderAppBar()}
      <main className="main">
        {renderMain()}
      </main>
    </div>
  );
}

export default App;
