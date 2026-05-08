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

    let turns = 0;
    let currentPlayer = players[1];

    const getScores = () => [players[0].score, players[1].score];
    const getNames = () => [players[0].name, players[1].name];

    const changeCurrentPlayer = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    }

    const setSymbol = (symbol) => {
        players[0].symbol = symbol;
        players[1].symbol = symbol === 'X' ? 'O' : 'X';
    }

    const resetGame = () => {
        gameBoard.resetBoard();
        currentPlayer = players[1];
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
            return true;
        }
        return false;
    }

    const handleWin = () => {
        if (checkIfWon()) {
            currentPlayer.score++;
            return true;
        }
        return false;
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
        return false;
    }

    const handleTurn = (row, column) => {
        turns++;
        gameBoard.setInput(row, column, currentPlayer.symbol);
        const prevTurns = turns;
        const isWon = handleWin();
        const isTie = handleTie();
        if (!isWon && !isTie) changeCurrentPlayer();
        return { isWon, isTie, currentPlayer, scores: getScores(), names: getNames(), prevTurns };
    }

    const handleStart = (
        symbol = players[0].symbol,
        p1Name = players[0].name,
        p2Name = players[1].name
    ) => {
        setPlayerNames(p1Name, p2Name);
        setSymbol(symbol);
        return { names: getNames() };
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
                cell.ariaLabel = 'Empty Cell';
                container.appendChild(cell);
            }
        }
        gameBoardContainer.appendChild(container);
    }

    const removeBoard = () => {
        gameBoardContainer.innerText = '';
    }

    const updateBoard = (cell, board) => {
        const selected = board[cell.dataset.row][cell.dataset.column];
        const color = selected === 'X' ? 'secondary' : 'tertiary';
        cell.innerText = selected;
        cell.classList.add(color);
        cell.ariaLabel = `Cell filled with ${selected}`;
    }

    const displayNewRound = (p1Symbol, p1Name, p2Name) => {
        const handleStartResult = gameController.handleStart(p1Symbol, p1Name, p2Name);
        displayBoard();
        const p2Color = p1Symbol === 'X' ? 'tertiary' : 'secondary';
        const p2Symbol = p1Symbol === 'X' ? 'O' : 'X';
        announcer.innerHTML = `Alright, <span class="${p2Color}">${handleStartResult.names[1]},</span> start by placing your <span class="${p2Color}">${p2Symbol}!</span>`;
        document.documentElement.style.setProperty('--hover-symbol', `'${p2Symbol}'`);
        document.documentElement.style.setProperty('--hover-symbol-color', `${p1Symbol === 'X' ? 'var(--clr-warning-a10)' : 'var(--clr-success-a20)'}`);
        return handleStartResult.names;
    }

    const displayScore = (scores, names) => {
        const p1Name = document.querySelector('[data-type="p1-name"]');
        const p2Name = document.querySelector('[data-type="p2-name"]');
        const p1Score = document.querySelector('[data-type="p1-score"]');
        const p2Score = document.querySelector('[data-type="p2-score"]');
        p1Name.innerText = `${names[0]}${names[0].slice(-1) === 's' ? "'" : "'s"} Score:`;
        p2Name.innerText = `${names[1]}${names[1].slice(-1) === 's' ? "'" : "'s"} Score:`;
        p1Score.innerText = `${scores[0]}`;
        p2Score.innerText = `${scores[1]}`;
    }

    let gameOver = false;

    // Event Listeners
    gameBoardContainer.addEventListener('click', (e) => {
        if (e.target.closest('[data-type="cell"]')) {
            const cell = e.target.closest('[data-type="cell"]');
            const board = gameBoard.getBoard();
            if (board[cell.dataset.row][cell.dataset.column] || gameOver) return;
            const handleTurnResult = gameController.handleTurn(cell.dataset.row, cell.dataset.column);
            const color = handleTurnResult.currentPlayer.symbol === 'X' ? 'secondary' : 'tertiary';
            const currentPlayerName = handleTurnResult.currentPlayer.name;
            const currentPlayerSymbol = handleTurnResult.currentPlayer.symbol;
            document.documentElement.style.setProperty('--hover-symbol', `'${currentPlayerSymbol}'`);
            document.documentElement.style.setProperty('--hover-symbol-color', `${currentPlayerSymbol === 'O' ? 'var(--clr-warning-a10)' : 'var(--clr-success-a20)'}`);
            if (handleTurnResult.isWon) {
                announcer.innerHTML = `Congratulations! <span class="${color}">${currentPlayerName},</span> won in ${handleTurnResult.prevTurns} turns!`
                displayScore(handleTurnResult.scores, handleTurnResult.names);
                gameOver = true;
            } else if (handleTurnResult.isTie) {
                announcer.innerText = "It's a Tie!";
                gameOver = true;
            } else {
                announcer.innerHTML = `<span class="${color}">${currentPlayerName},</span> it's your turn to place your <span class="${color}">${currentPlayerSymbol}!</span>`
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
            const symbol = gameController.resetGame();
            gameOver = false;
            removeBoard();
            displayNewRound(symbol);
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
