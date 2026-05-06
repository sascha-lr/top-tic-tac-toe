"use strict";

const gameBoard = (() => {

    const createBoard = () => {
        return [
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
        ];
    }

    let board = createBoard();

    const getBoard = () => board;
    const resetBoard = () => board = createBoard();
    const setInput = (row, column, symbol) => {
        board[row][column] = symbol;
    }

    return { getBoard, setInput, resetBoard }

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

    const setPlayerNames = (player1Name, player2Name) => {
        players[0].name = player1Name ? player1Name : 'Player 1';
        players[1].name = player2Name ? player2Name : 'Player 2';
    }

    let turns = 0;
    let currentPlayer = players[0];

    const changeCurrentPlayer = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    }

    const setSymbol = (symbol) => {
        players[0].currentSymbol = symbol;
        players[1].currentSymbol = symbol === 'X' ? 'O' : 'X';
    }

    const handleTie = () => {
        if (turns >= 9) {
            resetGame();
            return "It's a Draw!";
        }
    }

    const resetGame = () => {
        gameBoard.resetBoard();
        currentPlayer = players[0];
        turns = 0;
    }

    const hardReset = () => {
        resetGame();
        for (let player of players) {
            player.score = 0;
        }

    }

    const handleWin = () => {
        if (checkIfWon()) {
            const msg = `Congratulations, ${currentPlayer.name} won in ${turns} turns!`;
            currentPlayer.score++;
            resetGame();
            return msg;
        }
    }

    const checkIfWon = () => {
        if (turns > 4 && turns < 9) {
            const board = gameBoard.getBoard();
            for (let row of board) {
                if (row[0] && row[1] && row[2]) {
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

    const takeTurn = (row, column) => {
        turns++;
        gameBoard.setInput(row, column, currentPlayer.currentSymbol);
        const winnerMessage = handleWin();
        const drawMessage = handleTie();
        changeCurrentPlayer();
        return { winnerMessage, drawMessage };
    }

    const start = (symbol = players[0].currentSymbol, p1Name = players[0].name, p2Name = players[1].name) => {
        setPlayerNames(p1Name, p2Name);
        changeCurrentPlayer();
        setSymbol(symbol);
    }

    const getCurrentPlayer = () => currentPlayer;
    const getScores = () => [players[0].score, players[1].score];
    const getNames = () => [players[0].name, players[1].name];

    return { start, takeTurn, getCurrentPlayer, resetGame, hardReset, getScores, getNames };

})();

const screenController = (() => {

    // Elements
    const main = document.querySelector('main');
    const gameBoardContainer = document.querySelector('.game-board');
    const form = document.querySelector('form');
    const announcer = document.querySelector('.announcer');
    const dialog = document.querySelector('dialog');

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
                cell.dataset.type = 'cell';
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

    const updateBoard = (cell, board) => {
        cell.innerText = `${board[cell.dataset.row][cell.dataset.column]}`;
    }

    const diplayNewRound = (p1Symbol, p1Name, p2Name) => {
        gameController.start(p1Symbol, p1Name, p2Name);

        const currentPlayer = gameController.getCurrentPlayer();

        displayBoard();
        announcer.innerText = `${currentPlayer.name}, please pick a square to place your ${currentPlayer.currentSymbol}`;
    }

    const displayScore = () => {
        const p1Score = document.querySelector('[data-type="p1-score"]')
        const p2Score = document.querySelector('[data-type="p2-score"]')
        const scores = gameController.getScores();
        const names = gameController.getNames();
        p1Score.innerText = `${names[0]}${names[0].slice(-1) === 's' ? "'" : "'s"} Score: ${scores[0]}`;
        p2Score.innerText = `${names[1]}${names[1].slice(-1) === 's' ? "'" : "'s"} Score: ${scores[1]}`;
    }

    // Event Listeners
    let gameOver = false;
    gameBoardContainer.addEventListener('click', (e) => {
        if (e.target.closest('[data-type="cell"]')) {
            const cell = e.target.closest('[data-type="cell"]');
            const board = gameBoard.getBoard();
            if (board[cell.dataset.row][cell.dataset.column] || gameOver === true) return;
            const isGameOver = gameController.takeTurn(cell.dataset.row, cell.dataset.column);
            const currentPlayer = gameController.getCurrentPlayer();
            if (isGameOver.winnerMessage) {
                announcer.innerText = isGameOver.winnerMessage;
                displayScore();
                gameOver = true;
            } else if (isGameOver.drawMessage) {
                announcer.innerText = isGameOver.drawMessage;
                gameOver = true;
            } else {
                announcer.innerText = `${currentPlayer.name}, please pick a square to place your ${currentPlayer.currentSymbol}`;
            }
            updateBoard(cell, board);
        }
    })

    main.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="reset"]')) {
            gameController.hardReset();
            gameOver = false;
            removeBoard();
            displayScore();
            dialog.showModal();
        }
        if (e.target.closest('[data-action="new-round"]')) {
            if (!gameOver) gameController.resetGame();
            gameOver = false;
            removeBoard();
            diplayNewRound();
        }
    })

    form.addEventListener('submit', () => {
        const formData = new FormData(form);
        const p1Symbol = formData.get('symbol');
        const p1NameForm = formData.get('p1-name');
        const p2NameForm = formData.get('p2-name');

        diplayNewRound(p1Symbol, p1NameForm, p2NameForm);
        displayScore();
    })

    dialog.showModal();

})();
