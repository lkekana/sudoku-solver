var perfectSet = [1,2,3,4,5,6,7,8,9];

var solution = Array(9);
for (let x = 0; x < 9; x++) {
    solution[x] = new Array(9);
}

class singleBlock {
    constructor(x, y, value) {
      this.x = x;
      this.y = y;
      this.value = value;
      this.potentialValues = [];
    }
    setPotentialValues(){
        let row = getRow(inputValues,this.x,this.y);
        let column = getColumn(inputValues,this.x,this.y);
        let block = getBlockAs1DArray(inputValues,this.x,this.y);

        for (let i = 0; i < perfectSet.length; i++) {
            if (row.includes(perfectSet[i]) || column.includes(perfectSet[i]) || block.includes(perfectSet[i])){
            }
            else{
                this.potentialValues.push(perfectSet[i]);
            }
        }
    }
    getEmptyBlockCount(){
        let block = getBlockAs1DArray(inputValues,this.x,this.y);
        return countEmptySlots(block);
    }
    getEmptyRowCount(){
        let row = getRow(inputValues,this.x,this.y);
        return countEmptySlots(row);
    }
    getEmptyColumnCount(){
        let column = getColumn(inputValues,this.x,this.y);
        return countEmptySlots(column);
    }
}

function countEmptySlots(array) {
    let result = 0;
    for (let i = 0; i < array.length; i++) {
        if (array[i] == -1){
            result = result + 1;
        }
    }
    return result;
}



function getBlockNum(xIn,yIn) {
    /*
        blocks are 3x3 over the 9x9 grid

        if x in {0..2} - block 1,4,7
        else if x in {3..5} - block 2,5,8
        else if x in {6..8} - block 3,6,9

        if y in {0..2} - block 1,2,3
        else if y in {3..5} - block 4,5,6
        else if y in {6..8} - block 7,8,9
    */

    var xOptions = [];

    if (x >= 0 && x <= 2){
        xOptions = [1,4,7];
    }
    else if (x >= 3 && x <= 5){
        xOptions = [2,5,8];
    }
    else if (x >= 6 && x <= 8){
        xOptions = [3,6,9];
    }

    var yOptions = [];

    if (y >= 0 && y <= 2){
        yOptions = [1,2,3];
    }
    else if (y >= 3 && y <= 5){
        yOptions = [4,5,6];
    }
    else if (y >= 6 && y <= 8){
        yOptions = [7,8,9];
    }

    const finalBlock = xOptions.filter(value => yOptions.includes(value));
    //alert("(" + String(xIn) + "," + String(yIn) + ") in block " + String(finalBlock[0]));
}

function getBlock(matrix,xIn,yIn){
    //get leftmost digit
    var leftEdge = xIn;
    if (leftEdge % 3 === 2){
        //abc (x is c)
        leftEdge = leftEdge - 2;
    }
    else if (leftEdge % 3 === 1){
        //abc (x is b)
        leftEdge = leftEdge - 1;
    }


    var topEdge = yIn;
    if (topEdge % 3 === 2){
        //a
        //b
        //c
        //(x is c)
        topEdge = topEdge - 2;
    }
    else if (topEdge % 3 === 1){
        //a
        //b
        //c
        //(x is b)
        topEdge = topEdge - 1;
    }

    var result = new Array(3);
    for (let i = 0; i < 3; i++) {
        result[i] = new Array(3);
    }

    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            result[x][y] = matrix[leftEdge+x][topEdge+y];
        }
    }
    return result;
}

function getBlockAs1DArray(matrix,xIn,yIn) {
    //row by row, instead of column by column
    var bigBlock = getBlock(matrix,xIn,yIn);

    let count = 0;
    var result = Array(9);

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            result[count++] = bigBlock[x][y];
        }
    }

    return result;
}

function getRow(matrix,xIn,yIn){
    var result = Array(9);

    for (let i = 0; i < 9; i++) {
        result[i] = matrix[i][yIn];
    }

    return result;
}

function getColumn(matrix,xIn,yIn) {
    return matrix[xIn];
}

function puzzleContainsErrors(puzzle) {
    console.log("checking puzzle for errors");
    console.log(puzzle);

    //function to find duplicates
    let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) !== index);

    //check row without empties
    for (let i = 0; i < 9; i++){
        var tempRow = [];
        tempRow.length = 0;

        for (let j = 0; j < 9; j++){
            if (puzzle[i][j] !== -1){
                tempRow.push(puzzle[i][j]);
            }
        }

        //get array of dupes, if it has elements, puzzle contains an error
        if (findDuplicates(tempRow).length > 0){
            console.log("found dupes in row: ");
            console.log(tempRow);
            return true;
        }
    }


    //check columns without empties
    for (let i = 0; i < 9; i++){
        var tempCol = [];
        tempCol.length = 0;

        for (let j = 0; j < 9; j++){
            if (puzzle[j][i] !== -1){
                tempCol.push(puzzle[j][i]);
            }
        }

        //get array of dupes, if it has elements, puzzle contains an error
        if (findDuplicates(tempCol).length > 0){
            console.log("found dupes in col: ");
            console.log(tempCol);
            return true;
        }
    }

    //check each block on board
    for (let x = 0; x < 9; x++){
        for (let y = 0; y < 9; y++){
            //check block without empties
            var bigBlock = getBlock(puzzle,x,y);

            let a = 0;
            var blockArray = Array(9);

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (bigBlock[j][i] !== -1){
                        blockArray[a++] = bigBlock[j][i];
                    }
                }
            }

            //get array of dupes, if it has elements, puzzle contains an error
            if (findDuplicates(blockArray).length > 0){
                console.log("found dupes in block: ");
                console.log(blockArray);
                return true;
            }
        }
    }

    return false;
}

function solve(potential_solution) {
    let didFirstPart = false;
    console.log(potential_solution);

    //update solution on-screen
    updateValuesOnBoard(potential_solution);

    /*
    written with recursion in mind
        1.  find all potentials
        2.  sort by fewest values (as a stack)
        3.  pop top value
        4.  if (top has 1 solution):
                add to solutions
                call new function
            else:
                while (!valid && solutions > 0):
                    pop 1 potential solution
                    
                    if (no errors on puzzle):
                        valid = true
                
                if (valid):
                    call new function
    */
    var puzzle_with_potentials = [];

    //check each block for an easy fix and fix in the quick fix without checking all possible solutions
    
    //middle block pos x & y
    let found1 = false;
    let found2 = false;
    for (let yVal = 1; yVal < 9; yVal = yVal + 3) {
        for (let xVal = 1; xVal < 9; xVal = xVal + 3) {
            let block = getBlockAs1DArray(potential_solution,xVal,yVal);
            if (countEmptySlots(block) === 1){
                let i = temp.indexOf(-1);
                let mod = 0;

                if (i >= 0 && i <= 2){
                    //one column above (x,y) => (x,y-1)
                    mod = i - 1;

                    for (let j = 1; j <= 9; j++) {
                        if (!block.includes(j)){
                            potential_solution[xVal+mod][yVal-1] = j;
                            found1 = found2 = true;
                            break;
                        }
                    }

                    didFirstPart = true;
                }
                else if (i >= 3 && i <= 5){
                    //same column as (x,y)
                    mod = (i % 3) - 1;

                    for (let j = 1; j <= 9; j++) {
                        if (!block.includes(j)){
                            potential_solution[xVal+mod][yVal] = j;
                            found1 = found2 = true;
                            break;
                        }
                    }

                    didFirstPart = true;
                }
                else if (i >= 6 && i <= 8){
                    //one column below (x,y) => (x,y+1)
                    mod = (i % 3) - 1;
                    for (let j = 1; j <= 9; j++) {
                        if (!block.includes(j)){
                            potential_solution[xVal+mod][yVal+1] = j;
                            found1 = found2 = true;
                            break;
                        }
                    }

                    didFirstPart = true;
                }

            }
            if (found1) break;
        }
        if (found2) break;
    }

    if (!didFirstPart){
        //check rows
        found1 = false;
        for (let xVal = 0; xVal < 9; xVal++) {
            let row = getRow(potential_solution,xVal,xVal);
            if (countEmptySlots(row) === 1){
                let i = row.indexOf(-1);

                for (let j = 1; j <= 9; j++) {
                    if (!row.includes(j)){
                        potential_solution[xVal][i] = j;
                        found1 = true;
                        break;
                    }
                }

                didFirstPart = true;
                if (found1) break;
            }
        }
    }

    if (!didFirstPart){
        //check columns
        found1 = false;
        for (let xVal = 0; xVal < 9; xVal++) {
            let col = getColumn(potential_solution,xVal,xVal);
            let temp = new singleBlock(xVal,xVal,potential_solution[xVal,xVal]);
            if (countEmptySlots(col) === 1){
                let i = col.indexOf(-1);

                for (let j = 1; j <= 9; j++) {
                    if (!row.includes(j)){
                        potential_solution[xVal][i] = j;
                        found1 = true;
                        break;
                    }
                }
                didFirstPart = true;
                if (found1) break;
            }
        }
    }

    if (didFirstPart){
        solve(potential_solution);
    }
    else{


        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                if (potential_solution[x][y] === -1)
                    puzzle_with_potentials.push(new singleBlock(x,y,potential_solution[x,y]));
            }
        }

        console.log(String(puzzle_with_potentials.length) + " empty blocks atm");

        if (puzzle_with_potentials.length > 0){
            //find all potentials
            for (let i = 0; i < puzzle_with_potentials.length; i++) {
                puzzle_with_potentials[i].setPotentialValues();
            }

            //sort by fewest
            for (let i = 0; i < puzzle_with_potentials.length - 1; i++) {
                for (let j = 0; j < puzzle_with_potentials.length - i - 1; j++) {
                    if (puzzle_with_potentials[j].potentialValues.length < puzzle_with_potentials[j+1].potentialValues.length){
                        var swap = puzzle_with_potentials[j];
                        puzzle_with_potentials[j] = puzzle_with_potentials[j+1];
                        puzzle_with_potentials[j+1] = swap;
                    }
                }
            }

            //note pop returns & removes the last element
            var top = puzzle_with_potentials.pop();

            if (top.potentialValues.length === 1){
                potential_solution[top.x][top.y] = top.potentialValues[0];
                solve(potential_solution);
            }
            else if (top.potentialValues.length > 1){
                let valid = false;
                while (!valid && top.potentialValues.length > 0){
                    //ps is potential solution
                    let ps = top.potentialValues.pop();

                    let tempCopy = Array(9);
                    for (let i = 0; i < 9; i++){
                        tempCopy[i] = potential_solution[i].slice();
                    }

                    //check if no errors
                    //for each value, make sure that
                    if (!puzzleContainsErrors(potential_solution)){
                        valid = true;
                    }
                }

                if (valid){
                    solve(potential_solution);
                }
                else{
                    alert("Something went wrong while solving the puzzle.");
                }
            }
        }
    }
}

function updateValuesOnBoard(values) {
    for (let i = 0; i < 9; i++){
        for (let j = 0; j < 9; j++){
            let tempID = String(i+1) + "," + String(j+1);
            if (!givenValues.includes(tempID) && values[i][j] !== -1){
                const tempInput = document.getElementById(String(tempID));
                tempInput.value = parseInt(String(values[i][j]));
            }
        }
    }
}