import React from 'react';
import ReactDOM from 'react-dom';

import './index.css'

function Square(props) { // child controlled component
  return (
    <button
      className="square"
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component { // parent component
  renderSquare(key, i, coords) {
    return (
      <Square
        key={key}
        value={this.props.squares[i]} // passing props: data flow from parent to children
        onClick={() => this.props.onClick(i, coords)}
      />
    );
  }

  render() {
    let i = 0;
    const board = Array(3).fill(null).map((_, rowIndex) => {
      const cols = Array(3).fill(null).map((_, colIndex) => {
        return this.renderSquare(colIndex, i++, [colIndex + 1, rowIndex + 1]);
      })
      return (<div key={rowIndex} className='board-row'>{cols}</div>);
    })
    return (<div>{board}</div>);
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        coords: null,
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      orderIsAscending: true,
    };
  }

  handleClick(i, coords) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWin(squares) || squares[i]) return;

    document.querySelector('.move-list .active') && this.removeSelection();

    squares[i] = this.state.xIsNext ? 'x' : 'o';

    this.setState({
      history: history.concat([{
        coords: coords,
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  removeSelection() {
    const DOMMoveItems = document.querySelectorAll('.move-list li');
    [...DOMMoveItems].forEach(item => item
      .querySelector('button')
      .classList.remove('active'));
  }

  jumpTo(event, step) {
    this.removeSelection();
    event.target.classList.add('active');
    document.querySelector('.game-board>div').classList.remove('end-game');

    this.setState({
      stepNumber: step,
      xIsNext: (step % 2 === 0),
    });
  }

  changeMovesOrder() {
    this.setState({
      orderIsAscending: !this.state.orderIsAscending,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const win = calculateWin(current.squares);

    const moves = history.map((move, step) => {
      const desc = step ?
        `[${move.coords.join(', ')}] Go to move # ${step}` :
        'Go to game start';
      
      return (
        <li className="move" key={step}>
          <button onClick={(event) => this.jumpTo(event, step)}>
            {desc}
          </button>
        </li>
      );
    });

    let status = '';
    const DOMsquares = document.querySelectorAll('.square');
    if (win) {
      status = 'Winner: ' + win.winner;
      win.line.forEach(el => DOMsquares[el].classList.add('end-game'));
    } else if (current.squares.filter(square => !square).length !== 0) {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      [...DOMsquares].forEach(el => el.classList.remove('end-game'));
    } else {
      status = 'The Draw';
      document.querySelector('.game-board>div').classList.add('end-game')
    }

    const ordering = this.state.orderIsAscending ?
      'descending' :
      'ascending';
    const orderedMoves = this.state.orderIsAscending ?
      moves.slice() :
      moves.slice().reverse();

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i, coords) => this.handleClick(i, coords)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button
            className="sort"
            onClick={() => this.changeMovesOrder()}
          >List by: {ordering}</button>
          <ul className="move-list">{orderedMoves}</ul>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

// ========================================

function calculateWin(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        line: lines[i],
      };
    }
  }
  return null;
};
