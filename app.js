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
    const getCurrentPlayer = () => currentPlayer;
    const getBoard = () => gameBoard.getBoard();

    const changeCurrentPlayer = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    }

    const switchFirstPlayer = () => {
        currentPlayer = (players[0].score + players[1].score) % 2 !== 0 ? players[0] : players[1];
    }

    const setSymbol = (symbol) => {
        players[0].symbol = symbol;
        players[1].symbol = symbol === 'X' ? 'O' : 'X';
    }


    const resetGame = () => {
        gameBoard.resetBoard();
        switchFirstPlayer();
        turns = 0;
    }

    const hardReset = () => {
        resetGame();
        currentPlayer = players[1];
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
        const winnerCombo = checkIfWon();
        if (winnerCombo) {
            currentPlayer.score++;
            return winnerCombo;
        }
        return false;
    }

    const checkIfWon = () => {
        if (turns > 4 && turns <= 9) {
            const board = getBoard();

            for (let i = 0; i < board.length; i++) {
                if (board[i][0] &&
                    board[i][0] === board[i][1] &&
                    board[i][1] === board[i][2]) {
                    return { rows: [i, i, i], columns: [0, 1, 2] }
                }
            }
            for (let i = 0; i < board[0].length; i++) {
                if (board[0][i] &&
                    board[0][i] === board[1][i] &&
                    board[1][i] === board[2][i]) {
                    return { rows: [0, 1, 2], columns: [i, i, i] }
                }
            }
            if (board[1][1] && (board[1][1] === board[0][0] && board[1][1] === board[2][2])) {
                return { rows: [0, 1, 2], columns: [0, 1, 2] }
            }
            if (board[1][1] && (board[1][1] === board[0][2] && board[1][1] === board[2][0])) {
                return { rows: [0, 1, 2], columns: [2, 1, 0] }
            }
        }
        return false;
    }

    const handleTurn = (row, column) => {
        turns++;
        gameBoard.setInput(row, column, currentPlayer.symbol);
        const isWon = handleWin();
        const isTie = handleTie();
        if (!isWon && !isTie) changeCurrentPlayer();
        return { isWon, isTie, getScores, turns };
    }

    const handleStart = (
        symbol = players[0].symbol,
        p1Name = players[0].name,
        p2Name = players[1].name
    ) => {
        setPlayerNames(p1Name, p2Name);
        setSymbol(symbol);
    }

    return { handleStart, handleTurn, resetGame, hardReset, getCurrentPlayer, getNames, getBoard };

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

        const boardArray = gameController.getBoard();
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
        const scoreCards = document.querySelectorAll('.score-card');
        if (p1Symbol) scoreCards.forEach((card) => card.classList.toggle('inverse', p1Symbol === 'O'));
        gameController.handleStart(p1Symbol, p1Name, p2Name);
        displayBoard();
        const displayTurnResult = displayTurn();
        announcer.innerHTML = `Alright, <span class="${displayTurnResult.color}">${displayTurnResult.name},</span> start by placing your <span class="${displayTurnResult.color}">${displayTurnResult.symbol}!</span>`;
    }

    const displayTurn = () => {
        const color = gameController.getCurrentPlayer().symbol === 'X' ? 'secondary' : 'tertiary';
        const symbol = gameController.getCurrentPlayer().symbol;
        const name = gameController.getCurrentPlayer().name;
        document.documentElement.style.setProperty('--hover-symbol', `'${symbol}'`);
        document.documentElement.style.setProperty('--hover-symbol-color', `${symbol === 'X' ? 'var(--clr-success-a20)' : 'var(--clr-warning-a10)'}`);
        return { color, symbol, name };
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

    const sanitize = (string) => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            "/": '&#x2F;',
        };
        const reg = /[&<>"'/]/ig;
        return string.replace(reg, (match) => (map[match]));
    }

    let gameOver = false;

    // Event Listeners
    gameBoardContainer.addEventListener('click', (e) => {
        if (e.target.closest('[data-type="cell"]')) {
            const cell = e.target.closest('[data-type="cell"]');
            const board = gameController.getBoard();
            if (board[cell.dataset.row][cell.dataset.column] || gameOver) return;
            const handleTurnResult = gameController.handleTurn(cell.dataset.row, cell.dataset.column);
            const displayTurnResult = displayTurn();
            if (handleTurnResult.isWon) {
                announcer.innerHTML = `Congratulations! <span class="${displayTurnResult.color}">${displayTurnResult.name},</span> won in ${handleTurnResult.turns} turns!`
                displayScore(handleTurnResult.getScores(), gameController.getNames());
                for (let i = 0; i < 3; i++) {
                    document.querySelector(`[data-type="cell"][data-row="${handleTurnResult.isWon.rows[i]}"][data-column="${handleTurnResult.isWon.columns[i]}"]`).classList.add('border');
                }
                gameOver = true;
            } else if (handleTurnResult.isTie) {
                announcer.innerText = "It's a Tie!";
                gameOver = true;
            } else {
                announcer.innerHTML = `<span class="${displayTurnResult.color}">${displayTurnResult.name},</span> it's your turn to place your <span class="${displayTurnResult.color}">${displayTurnResult.symbol}!</span>`
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
            gameController.resetGame();
            gameOver = false;
            removeBoard();
            displayNewRound();
        }
    })

    form.addEventListener('submit', () => {
        const formData = new FormData(form);
        const p1Symbol = formData.get('symbol');
        const p1NameForm = sanitize(formData.get('p1-name'));
        const p2NameForm = sanitize(formData.get('p2-name'));
        form.reset();
        displayNewRound(p1Symbol, p1NameForm, p2NameForm);
        displayScore([0, 0], gameController.getNames());
    })

    dialog.showModal();

})();
