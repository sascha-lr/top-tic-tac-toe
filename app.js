"use strict";

const game = (() => {
    const board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ];

    let currentPlayer;
    let turns = 0;

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

    const setSymbol = (symbol) => {
        players[0].currentSymbol = symbol;
        players[1].currentSymbol = symbol === 1 ? 2 : 1;
    }

    const changeCurrentPlayer = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    }

    const takeInput = (row, column) => {
        board[row][column] = currentPlayer.currentSymbol;
    }

    const resetGame = () => {
        for (let row of board) {
            for (let i = 0; i < row.length; i++) {
                row[i] = 0;
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
        console.log(`Congratulations! Player ${players.indexOf(currentPlayer) + 1}, won the game!`);
    }

    const checkIfWon = () => {
        for (let row of board) {
            if (!row.find((element) => element === 0)) {
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

    const displayBoard = () => {
        for (let row of board) {
            console.log(row);
        }
    }

    const takeTurn = (row, column) => {
        console.log('------------');
        turns++;
        changeCurrentPlayer();
        console.log(`Player ${players.indexOf(currentPlayer) + 1}, please where do you want to put your ${currentPlayer.currentSymbol}?`);
        takeInput(row, column);
        displayBoard();
        if (turns > 4 && checkIfWon()) {
            announceWinner();
            resetGame();
        }
    }

    const start = () => {
        console.log('Game is starting! Player 1, please pick a symbol');
        setSymbol(1);
        displayBoard();
    }

    return { start, takeTurn };

})();


