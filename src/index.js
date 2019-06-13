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
    if (calculateWinner(squares) || squares[i]) return;

    const moveList = document.querySelector('.move-list');
    moveList.querySelector('.active') && this.deactivateMoveList();

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

  deactivateMoveList() {
    const moves = document.querySelectorAll('.move-list li');
    [...moves].forEach(li => li.querySelector('button').classList.remove('active'));
  }

  jumpTo(event, step) {
    this.deactivateMoveList();
    event.target.classList.add('active');
    
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2 === 0),
    })
  }
  
  changeMovesOrder() {
    this.setState({
      orderIsAscending: !this.state.orderIsAscending,
    })

  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const moves = history.map((step, move) => {
      const desc = move ?
      `[${step.coords.join(', ')}] Go to move # ${move}` :
      'Go to game start';
      
      return (
        <li className="move" key={move}>
          <button onClick={(event) => this.jumpTo(event, move)}>
            {desc}
          </button>
        </li>
      )
    });
    
    let status;
    if (winner) status = 'Winner: ' + winner;
    else status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    
    const ordering = this.state.orderIsAscending ? 'descending' : 'ascending';
    const orderedMoves = this.state.orderIsAscending ? moves.slice() : moves.slice().reverse();

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

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 2, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
