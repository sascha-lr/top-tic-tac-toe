"use strict";

const gameBoard = (() => {

    const board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
    ];

    const getBoard = () => board;

    return { getBoard }

})();

const gameController = (() => {

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

    const changeCurrentPlayer = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    }

    const setSymbol = (symbol) => {
        players[0].currentSymbol = symbol;
        players[1].currentSymbol = symbol === 'X' ? 'O' : 'X';
    }

    const announceTie = () => {
        if (turns >= 9) {
            console.log('TIE');
        }
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
        if (checkIfWon()) {
            currentPlayer.score++;
            console.log('hoorarrara');
        }
    }

    const checkIfWon = () => {
        if (turns > 4 && turns < 9) {
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
    }

    const checkState = (() => {
        const WIN = announceWinner;
        const DRAW = announceTie;

        return { WIN, DRAW };
    })();

    const takeTurn = (row, column) => {
        turns++;
        changeCurrentPlayer();
        setInput(row, column);
        checkState.WIN();
        checkState.DRAW();
    }

    const start = (symbol) => {
        setSymbol(symbol);
    }

    return { start, takeTurn };

})();


const DOM = (() => {

    // Elements
    const gameBoardContainer = document.querySelector('.game-board');
    const form = document.querySelector('form');

    //Functions
    const displayBoard = () => {
        const container = document.createElement('div');
        container.classList.add('container');

        const boardArray = gameBoard.getBoard();
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
        gameBoardContainer.appendChild(container);
    }

    const removeBoard = () => {
        gameBoardContainer.innerText = '';
    }

    // Event Listeners
    gameBoardContainer.addEventListener('click', (e) => {
        if (e.target.closest('.cell')) {
            const cell = e.target.closest('.cell');
            const board = gameBoard.getBoard();
            if (board[cell.dataset.row][cell.dataset.column]) return;
            gameController.takeTurn(cell.dataset.row, cell.dataset.column);
            removeBoard();
            displayBoard();
        }
    })

    form.addEventListener('submit', () => {
        const formData = new FormData(form);
        gameController.start(formData.get('symbol'));
        displayBoard();
    })

    return {};

})();
