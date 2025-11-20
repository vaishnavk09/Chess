const socket = io();
const chess = new Chess();
const boardElement = document.getElementById('chessBoard');  

let draggedPeice =null;
let sourceSquare = null;
let playerRole=null;

socket.on('playerColor', (color) => {
    playerRole = color.toLowerCase(); // Convert 'W' or 'B' to 'w' or 'b'
    console.log(`Player role set to: ${playerRole}`); // Debugging player role
    if (playerRole === 'b') {
        boardElement.classList.add('flipped'); // Flip the board for black player
    } else {
        boardElement.classList.remove('flipped'); // Ensure board is not flipped for white player
    }
    renderBoard(); // Render the board after setting the role
});

const renderBoard = () => {
    console.log(`Rendering board for player role: ${playerRole}`); // Debugging renderBoard
    const board = chess.board();
    boardElement.innerHTML = '';

    board.forEach((row, rowIndex) => {
        row.forEach((square, sqIndex) => {
            const sqElement = document.createElement('div');
            sqElement.classList.add(
                'square',
                (rowIndex + sqIndex) % 2 === 0 ? 'dark' : 'light'
            );
            sqElement.dataset.row = rowIndex;
            sqElement.dataset.col = sqIndex;

            if (square) {
                const peiceElement = document.createElement('div');
                peiceElement.classList.add(
                    'piece',
                    square.color === 'w' ? 'white' : 'black'
                );
                peiceElement.innerText = getPeiceUnicode(square);
                peiceElement.draggable = playerRole === square.color;

                peiceElement.addEventListener('dragstart', (e) => {
                    console.log(`Drag started for piece at (${rowIndex}, ${sqIndex})`); // Debugging dragstart
                    if (peiceElement.draggable) {
                        draggedPeice = peiceElement;
                        sourceSquare = { row: rowIndex, col: sqIndex };
                        e.dataTransfer.setData('text/plain', '');
                    }
                });
                peiceElement.addEventListener('dragend', () => {
                    console.log(`Drag ended for piece at (${rowIndex}, ${sqIndex})`); // Debugging dragend
                    draggedPeice = null;
                    sourceSquare = null;
                });

                sqElement.appendChild(peiceElement);
            }

            sqElement.addEventListener('dragover', (e) => {
                e.preventDefault();
                console.log(`Dragover at square (${rowIndex}, ${sqIndex})`); // Debugging dragover
            });

            sqElement.addEventListener('drop', (e) => {
                e.preventDefault();
                console.log(`Drop at square (${rowIndex}, ${sqIndex})`); // Debugging drop
                if (draggedPeice) {
                    const targetSource = {
                        row: parseInt(sqElement.dataset.row),
                        col: parseInt(sqElement.dataset.col),
                    };
                    HandleMove(sourceSquare, targetSource);
                }
            });

            boardElement.appendChild(sqElement);
        });
    });
};

const HandleMove = (source, target) => {
    const move={
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to:`${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion:'q',
    };
    socket.emit('move',move);
}

const getPeiceUnicode = (piece) => {
    const unicodePieces = {
        p: "♟", // Black pawn
        r: "♜", // Black rook
        n: "♞", // Black knight
        b: "♝", // Black bishop
        q: "♛", // Black queen
        k: "♚", // Black king
        P: "♙", // White pawn
        R: "♖", // White rook
        N: "♘", // White knight
        B: "♗", // White bishop
        Q: "♕", // White queen
        K: "♔", // White king
    };

    // Use piece.color to determine case
    const pieceKey = piece.color === "w" ? piece.type.toUpperCase() : piece.type.toLowerCase();
    return unicodePieces[pieceKey] || ""; // Ensure correct mapping
};

socket.on('spectatorRole',()=>{
    playerRole=null;
    renderBoard();
}
);

socket.on('boardState', (fen) => {
    console.log(`Board state updated: ${fen}`); // Debugging board state
    chess.load(fen); // Update the chess board state
    renderBoard(); // Re-render the board
});

socket.on('move', (move) => {
    console.log(`Move received: ${JSON.stringify(move)}`); // Debugging move
    chess.move(move); // Apply the move to the chess board
    renderBoard(); // Re-render the board
});


renderBoard();