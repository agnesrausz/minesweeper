const game = {
    init: function () {
        this.drawBoard();

        // TODO: do the rest of the game setup here (eg. add event listeners)
        this.initRightClick();

        this.initLeftClick();

        this.countFlagsLeft();


    },

    drawBoard: function () {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const rows = parseInt(urlParams.get('rows'));
        const cols = parseInt(urlParams.get('cols'));
        const mineCount = parseInt(urlParams.get('mines'));
        const minePlaces = this.getRandomMineIndexes(mineCount, cols, rows);

        let gameField = document.querySelector(".game-field");
        this.setGameFieldSize(gameField, rows, cols);
        let cellIndex = 0
        for (let row = 0; row < rows; row++) {
            const rowElement = this.addRow(gameField);
            for (let col = 0; col < cols; col++) {
                this.addCell(rowElement, row, col, minePlaces.has(cellIndex));
                cellIndex++;
            }
        }
    },
    getRandomMineIndexes: function (mineCount, cols, rows) {
        const cellCount = cols * rows;
        let mines = new Set();
        do {
            mines.add(Math.round(Math.random() * (cellCount - 1)));
        } while (mines.size < mineCount && mines.size < cellCount);
        return mines;
    },
    setGameFieldSize: function (gameField, rows, cols) {
        gameField.style.width = (gameField.dataset.cellWidth * rows) + 'px';
        gameField.style.height = (gameField.dataset.cellHeight * cols) + 'px';
    },
    addRow: function (gameField) {
        gameField.insertAdjacentHTML(
            'beforeend',
            '<div class="row"></div>'
        );
        return gameField.lastElementChild;
    },
    addCell: function (rowElement, row, col, isMine) {
        rowElement.insertAdjacentHTML(
            'beforeend',
            `<div class="field${isMine ? ' mine' : ''}"
                        data-row="${row}"
                        data-col="${col}"></div>`);
    },
    // reference solution for "Create mine flagging feature" user story
    initRightClick() {
        // we collect all fields of the game.
        // (the same selector is used as in the style.css file for finding the fields)
        const fields = document.querySelectorAll('.game-field .row .field');

        // for all fields...
        for (let field of fields) {
            // we add the same event listener for the right click (so called contextmenu) event
            field.addEventListener('contextmenu', function (event) {
                // so if you right click on any field...

                // context menu remains hidden
                event.preventDefault();

                // and "flagged" class toggles on the clicked element
                // (styles of "flagged" class are defined in style.css)
                event.currentTarget.classList.toggle('flagged');

                game.countFlagsLeft()
            });
        }
    },
    initLeftClick() {
        const fields = document.querySelectorAll('.game-field .row .field');
        for (let field of fields) {
            field.textContent = game.howManyMine(field);
            field.addEventListener('click', function (event) {
                event.preventDefault();

                if (!event.currentTarget.classList.contains('open') &&
                    !event.currentTarget.classList.contains('flagged')) {
                    event.currentTarget.classList.add('open');
                    if (!event.currentTarget.classList.contains('mine')) {
                        // event.currentTarget.textContent = game.howManyMine(event.currentTarget);
                        if (event.currentTarget.textContent === '') {
                            opener(event.currentTarget)
                        }
                    }
                }

                if (game.checkWin() || game.checkLose()) {
                    game.gameOver()
                }

                function opener(targetArea) {
                    console.log('start')
                    let checkRows = [
                        targetArea.dataset.row,
                        (parseInt(targetArea.dataset.row) + 1).toString(),
                        (parseInt(targetArea.dataset.row) - 1).toString()];
                    let checkCols = [
                        targetArea.dataset.col,
                        (parseInt(targetArea.dataset.col) + 1).toString(),
                        (parseInt(targetArea.dataset.col) - 1).toString()];
                    for (let cRow of checkRows) {
                        for (let cCol of checkCols) {
                            try {
                                let newTargetArea = document.querySelector
                                    ('[data-row = "'+ cRow +'"][data-col = "' + cCol +'"]')
                                if (newTargetArea.innerText === '' &&
                                    !newTargetArea.classList.contains('open')) {
                                    newTargetArea.classList.add('open');
                                    opener(newTargetArea);
                                } else if (parseInt(newTargetArea.innerText) > 0){
                                    newTargetArea.classList.add('open');
                                }
                            } catch (Exception) {console.log('Exception opener');}
                        }
                    }
                }

            });
        }
    },
    countFlagsLeft() {
        let flagsLeftCounter = document.querySelector('#flags-left-counter');
        let mines = document.querySelectorAll('.mine').length;
        let flags = document.querySelectorAll('.flagged').length;
        flagsLeftCounter.value = mines - flags;
    },
    checkWin() {
        const fields = document.querySelectorAll('.game-field .row .field');
        for (let field of fields) {
            if ((!field.classList.contains('open') && !field.classList.contains('mine')) ||
                (field.classList.contains('open') && field.classList.contains('mine'))){
                return false
            }
        }
        return true
    },
    checkLose() {
        const fields = document.querySelectorAll('.game-field .row .field');
        for (let field of fields) {
            if (field.classList.contains('open') && field.classList.contains('mine')) {

                return true
            }
        }
        return false
    },
    gameOver() {
        if (game.checkWin() || game.checkLose()) {
            const fields = document.querySelectorAll('.game-field .row .field');
            for (let field of fields) {
                field.classList.contains('mine') ? field.classList.add('open') : null;
                field.replaceWith(field.cloneNode(true));
            }
        }
    },

    howManyMine(myTarget) {
        let counter = 0;
        let checkRows = [
            myTarget.dataset.row,
            (parseInt(myTarget.dataset.row) + 1).toString(),
            (parseInt(myTarget.dataset.row) - 1).toString()];
        let checkCols = [
            myTarget.dataset.col,
            (parseInt(myTarget.dataset.col) + 1).toString(),
            (parseInt(myTarget.dataset.col) - 1).toString()];
        for (let cRow of checkRows) {
            for (let cCol of checkCols) {
                try {
                    if (document.querySelector
                        ('[data-row = "'+ cRow +'"][data-col = "' + cCol +'"]')
                        .classList.contains('mine')) {
                        counter += 1;
                    }
                } catch (Exception) {console.log('Exception');}
            }
        }
        counter = myTarget.classList.contains('mine') ? 'mine' : counter;
        return counter === 0 ? null : (counter === 'mine' ? 'mine' : counter);
    }

};

game.init();
