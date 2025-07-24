import React from 'react';

// PUBLIC_INTERFACE
export default function GameHistoryList({ games, onSelect }) {
  return (
    <div className="history-list">
      <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>My Games</h3>
      {(!games || games.length === 0) ? (
        <div style={{ color: '#666', margin: 16 }}>No games found.</div>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Game ID</th>
              <th>X</th>
              <th>O</th>
              <th>Winner</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {games.map(g => (
              <tr key={g.id} className={g.winner ? 'finished' : ''}>
                <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{g.id.slice(-6)}</td>
                <td>{g.player_x}</td>
                <td>{g.player_o}</td>
                <td>
                  {g.winner
                    ? g.winner === 'draw'
                      ? 'Draw'
                      : g.winner
                    : ''}
                </td>
                <td>{g.status}</td>
                <td>{new Date(g.created_at).toLocaleString()}</td>
                <td>
                  <button className="btn btn-small" style={{ background: 'var(--accent-color)' }} onClick={() => onSelect(g.id)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
