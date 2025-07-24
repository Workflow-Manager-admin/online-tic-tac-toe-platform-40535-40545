import React from 'react';

// PUBLIC_INTERFACE
export default function GameBoard({ game, onCellClick, disabled }) {
  if (!game) return null;

  const { board, turn, player_x, player_o, status, winner } = game;

  function renderCell(i, j) {
    const cellValue = board[i][j];
    return (
      <button
        className="ttt-cell"
        key={i + '-' + j}
        data-test={`cell-${i}-${j}`}
        disabled={!!cellValue || !!winner || disabled}
        onClick={() => onCellClick(i, j)}
        style={{
          color:
            cellValue === 'X'
              ? 'var(--primary-color)'
              : cellValue === 'O'
              ? 'var(--accent-color)'
              : undefined,
        }}
      >
        {cellValue}
      </button>
    );
  }

  return (
    <div className="gameboard-container">
      <div className="players-info">
        <span
          className={turn === 'X' ? 'current-player' : ''}
          style={{ color: 'var(--primary-color)' }}
        >
          X: {player_x}
        </span>
        <span style={{ padding: '0 10px', fontWeight: 600 }}>vs</span>
        <span
          className={turn === 'O' ? 'current-player' : ''}
          style={{ color: 'var(--accent-color)' }}
        >
          O: {player_o}
        </span>
      </div>

      <div className="ttt-grid">
        {[0, 1, 2].map(i => (
          <div className="ttt-row" key={i}>
            {[0, 1, 2].map(j => renderCell(i, j))}
          </div>
        ))}
      </div>
      <div className="game-status">
        {winner
          ? winner === 'draw'
            ? 'It\'s a Draw!'
            : `Winner: ${winner === 'X' ? player_x : player_o} (${winner})`
          : status === 'ongoing'
          ? `Turn: ${turn} (${turn === 'X' ? player_x : player_o})`
          : status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    </div>
  );
}
