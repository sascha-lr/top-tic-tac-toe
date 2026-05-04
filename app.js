"use strict";

const game = (() => {
    const board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
    ];

    const players = [
        {
            currentSymbol: undefined,
            score: 0,
        },
        {
            currentSymbol: undefined,
            score: 0,
        },
    ];

    let turns = 0;
    let currentPlayer = players[1];

    const setSymbol = (symbol) => {
        players[0].currentSymbol = symbol;
        players[1].currentSymbol = symbol === 'X' ? 'O' : 'X';
    }

    const changeCurrentPlayer = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    }

    const setInput = (row, column) => {
        board[row][column] = currentPlayer.currentSymbol;
    }

    const resetGame = () => {
        for (let row of board) {
            for (let i = 0; i < row.length; i++) {
                row[i] = '';
            }
        }
        for (let player of players) {
            player.currentSymbol = undefined;
        }
        currentPlayer = undefined;
        turns = 0;
    }

    const hardReset = () => {
        resetGame();
        for (let player of players) {
            player.score = 0;
        }
    }

    const announceWinner = () => {
        currentPlayer.score++;
    }

    const checkIfWon = () => {
        for (let row of board) {
            if (!row.find((element) => element === '')) {
                if (row[0] === row[1] && row[1] === row[2]) {
                    return true;
                }
            }
        }
        let index = 0;
        for (let column of board[0]) {
            if (column) {
                if (board[0][index] === board[1][index] && board[1][index] === board[2][index]) {
                    return true;
                }
            }
            index++;
        }
        if (board[1][1]) {
            if ((board[1][1] === board[0][0] && board[1][1] === board[2][2])
                || (board[1][1] === board[0][2] && board[1][1] === board[2][0])) {
                return true;
            }
        }
    }

    const getBoard = () => board;

    const takeTurn = (element) => {
        const cell = DOM.getInput(element);
        turns++;
        changeCurrentPlayer();
        setInput(cell.dataset.row, cell.dataset.column);
        if (turns > 4 && checkIfWon()) {
            announceWinner();
        }
    }

    const start = (symbol) => {
        setSymbol(symbol);
    }

    return { start, getBoard, takeTurn };

})();


const DOM = (() => {

    // Elements
    const gameBoard = document.querySelector('.game-board');
    const form = document.querySelector('form');

    //Functions
    const displayBoard = () => {
        const container = document.createElement('div');
        container.classList.add('container');

        const boardArray = game.getBoard();
        let rowIndex = 0;
        for (let row of boardArray) {
            for (let i = 0; i < row.length; i++) {
                const cell = document.createElement('button');
                cell.dataset.row = `${rowIndex}`;
                cell.dataset.column = `${i}`;
                cell.classList.add('cell');
                cell.innerText = `${row[i]}`;
                container.appendChild(cell);
            }
            rowIndex++;
        }
        gameBoard.appendChild(container);
    }

    const removeBoard = () => {
        gameBoard.innerHTML = '';
    }

    const getInput = (element) => element;

    // Event Listeners
    gameBoard.addEventListener('click', (e) => {
        if (e.target.closest('.cell')) {
            const cell = e.target.closest('.cell');
            const board = game.getBoard();
            if (board[cell.dataset.row][cell.dataset.column]) return;
            game.takeTurn(cell);
            removeBoard();
            displayBoard();
        }
    })

    form.addEventListener('submit', () => {
        const formData = new FormData(form);
        game.start(formData.get('symbol'));
        displayBoard();
    })

    return { getInput };

})();
