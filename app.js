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
            symbol: undefined,
            score: 0,
        },
        {
            symbol: undefined,
            score: 0,
        },
    ];

    const setPlayerNames = (player1Name, player2Name) => {
        players[0].name = player1Name ? player1Name : 'Player 1';
        players[1].name = player2Name ? player2Name : 'Player 2';
    }

    const getScores = () => [players[0].score, players[1].score];
    const getNames = () => [players[0].name, players[1].name];

    let turns = 0;
    let currentPlayer = players[0];

    const changeCurrentPlayer = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    }

    const setSymbol = (symbol) => {
        players[0].symbol = symbol;
        players[1].symbol = symbol === 'X' ? 'O' : 'X';
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

    const handleTie = () => {
        if (turns >= 9) {
            resetGame();
            return "It's a Draw!";
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
        if (turns > 4 && turns <= 9) {
            const board = gameBoard.getBoard();

            for (let row of board) {
                if (row[0] &&
                    row[0] === row[1] &&
                    row[1] === row[2]) {
                    return true;
                }
            }
            for (let i = 0; i < board[0].length; i++) {
                if (board[0][i] &&
                    board[0][i] === board[1][i] &&
                    board[1][i] === board[2][i]) {
                    return true;
                }
            }
            if (board[1][1] &&
                (board[1][1] === board[0][0] &&
                    board[1][1] === board[2][2]) ||
                (board[1][1] === board[0][2] &&
                    board[1][1] === board[2][0])) {
                return true;
            }
        }
    }

    const handleTurn = (row, column) => {
        turns++;
        gameBoard.setInput(row, column, currentPlayer.symbol);
        const winnerMessage = handleWin();
        const drawMessage = handleTie();
        changeCurrentPlayer();
        const msg = `${currentPlayer.name}, please pick a square to place your ${currentPlayer.symbol}.`;
        return { winnerMessage, drawMessage, msg, scores: getScores(), names: getNames() };
    }

    const handleStart = (
        symbol = players[0].symbol,
        p1Name = players[0].name,
        p2Name = players[1].name
    ) => {
        setPlayerNames(p1Name, p2Name);
        changeCurrentPlayer();
        setSymbol(symbol);
        const msg = `Game starts: ${currentPlayer.name}, please pick a square to place your ${currentPlayer.symbol}.`
        return { msg, names: getNames() };
    }

    return { handleStart, handleTurn, resetGame, hardReset };

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
        for (let rowIndex = 0; rowIndex < boardArray.length; rowIndex++) {
            for (let columnIndex = 0; columnIndex < boardArray[rowIndex].length; columnIndex++) {
                const cell = document.createElement('button');
                cell.dataset.row = `${rowIndex}`;
                cell.dataset.column = `${columnIndex}`;
                cell.dataset.type = 'cell';
                cell.classList.add('cell');
                container.appendChild(cell);
            }
        }
        gameBoardContainer.appendChild(container);
    }

    const removeBoard = () => {
        gameBoardContainer.innerText = '';
    }

    const updateBoard = (cell, board) => {
        cell.innerText = `${board[cell.dataset.row][cell.dataset.column]}`;
    }

    const displayNewRound = (p1Symbol, p1Name, p2Name) => {
        const handleStartResult = gameController.handleStart(p1Symbol, p1Name, p2Name);
        displayBoard();
        announcer.innerText = handleStartResult.msg;
        return handleStartResult.names;
    }

    const displayScore = (scores, names) => {
        const p1Score = document.querySelector('[data-type="p1-score"]')
        const p2Score = document.querySelector('[data-type="p2-score"]')
        p1Score.innerText = `${names[0]}${names[0].slice(-1) === 's' ? "'" : "'s"} Score: ${scores[0]}`;
        p2Score.innerText = `${names[1]}${names[1].slice(-1) === 's' ? "'" : "'s"} Score: ${scores[1]}`;
    }

    let gameOver = false;

    // Event Listeners
    gameBoardContainer.addEventListener('click', (e) => {
        if (e.target.closest('[data-type="cell"]')) {
            const cell = e.target.closest('[data-type="cell"]');
            const board = gameBoard.getBoard();
            if (board[cell.dataset.row][cell.dataset.column] || gameOver === true) return;
            const handleTurnResult = gameController.handleTurn(cell.dataset.row, cell.dataset.column);
            if (handleTurnResult.winnerMessage) {
                announcer.innerText = handleTurnResult.winnerMessage;
                displayScore(handleTurnResult.scores, handleTurnResult.names);
                gameOver = true;
            } else if (handleTurnResult.drawMessage) {
                announcer.innerText = handleTurnResult.drawMessage;
                gameOver = true;
            } else {
                announcer.innerText = handleTurnResult.msg;
            }
            updateBoard(cell, board);
        }
    })

    main.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="reset"]')) {
            gameController.hardReset();
            gameOver = false;
            removeBoard();
            dialog.showModal();
        }
        if (e.target.closest('[data-action="new-round"]')) {
            if (!gameOver) gameController.resetGame();
            gameOver = false;
            removeBoard();
            displayNewRound();
        }
    })

    form.addEventListener('submit', () => {
        const formData = new FormData(form);
        const p1Symbol = formData.get('symbol');
        const p1NameForm = formData.get('p1-name');
        const p2NameForm = formData.get('p2-name');

        form.reset();

        const displayNewRoundNames = displayNewRound(p1Symbol, p1NameForm, p2NameForm);
        displayScore([0, 0], displayNewRoundNames);
    })

    dialog.showModal();

})();
