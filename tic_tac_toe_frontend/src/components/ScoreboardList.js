import React from 'react';

// PUBLIC_INTERFACE
export default function ScoreboardList({ scores, currentUser }) {
  return (
    <div className="scoreboard-list">
      <h3 style={{ color: 'var(--accent-color)' }}>Scoreboard</h3>
      {(!scores || scores.length === 0) ? (
        <div style={{ color: '#666', margin: 16 }}>No scoreboard data available.</div>
      ) : (
        <table className="scoreboard-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Draws</th>
            </tr>
          </thead>
          <tbody>
            {scores
              .sort((a, b) => b.wins - a.wins)
              .map((s, i) => (
                <tr key={s.username}
                  className={currentUser && s.username === currentUser ? 'this-user' : ''}>
                  <td>
                    {s.username}
                    {currentUser && s.username === currentUser && (
                      <span style={{ fontSize: 12, color: 'var(--accent-color)' }}>{' (You)'}</span>
                    )}
                  </td>
                  <td>{s.wins}</td>
                  <td>{s.losses}</td>
                  <td>{s.draws}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
