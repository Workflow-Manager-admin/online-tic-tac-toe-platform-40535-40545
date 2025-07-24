import React from 'react';

// PUBLIC_INTERFACE
export default function MoveHistoryTable({ moves }) {
  if (!moves || moves.length === 0) return null;
  return (
    <div className="move-history-table">
      <h4>Move History</h4>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Row</th>
            <th>Col</th>
          </tr>
        </thead>
        <tbody>
          {moves.map((move, idx) => (
            <tr key={idx}>
              <td>{move.move_number}</td>
              <td style={{ color: move.player === 'X' ? 'var(--primary-color)' : 'var(--accent-color)' }}>
                {move.player}
              </td>
              <td>{move.x}</td>
              <td>{move.y}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
