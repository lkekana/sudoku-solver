/*
    TO-DO:
        add if not found to second test
        finish solve code
        memory management
*/

/*
    naming convention for the data

    rows
    0-8

    cols
    a-i

        a   b   c   d   e   f   g   h   i
    0
    1
    2
    3
    4
    5
    6
    7
    8

    blocks
    b_tl,b_tm,b_tr
    b_ml,b_c,b_mr
    b_bl,b_bm,b_br



    each row, column and block needs to have numbers 1-9 without duplicates
    each can flattened and presented as an array. (3x3 blocks flattened row-by-row)



    we will create a data structure of missing values for each array called missing_values
    that has
        an associative array of arrays representing each row, col and block with missing values & name
        {
            "b_tr" : [2,4,7,8]
            "b_tm" : [1,8,2]
        }
        a number of missing values (sum total of items in above array)
        a function to adjust the missing values when a proper value is found


    we will create a data structure representing a single block called "num"

    that has
        3 properties holding the ids to each array
        its row & col position in 2d array of board
        the value of the block in question
        boolean value for whether it is empty or not



    we will also create an array containing every "num" (9x9=81 items)


    we will create a data structure called "table"
    which is a frequency table that checks a block, row or column

    that has
        function that returns true if there is a value with a freq of 1
        function that returns the value with a freq of 1
    

    when solve is called:
    make 2d array of nums (representing the board) called map
    //make an associative array with the ids of each row, col & block (3x9x9 = 3x81 = 243) called all
    create missing_values
        while (missing_values.count > 0):
            visually refresh board
            if (any item in missing values has only 1 item):
                use it
            else:
                get all potential values for each single block
                if (only 1 potential value):
                    use it
                else:
                    for (x in missing_values array):
                        create table using x
                        if (table has single missing value):
                            use it
                            break (from for loop)

    "use it" entails
    - calling missing_values.found function
    - add the value to num
    - set the single block to 0 (null)
    
*/

function getColID(int){
    return String(col_names[int]);
}

var block_names = ["b_tl","b_tm","b_tr","b_ml","b_c","b_mr","b_bl","b_bm","b_br"];
var col_names = ["a","b","c","d","e","f","g","h","i"];
var row_names = ["0","1","2","3","4","5","6","7","8"];
var perfectSet = [1,2,3,4,5,6,7,8,9];

/*
    we will create a data structure of missing values for each array called missing_values
    that has
        an associative array of arrays representing each row, col and block with missing values & name
        {
            "b_tr" : [2,4,7,8]
            "b_tm" : [1,8,2]
        }
        a number of missing values (sum total of items in above array)
        a function to adjust the missing values when a proper value is found
*/

function getComplimentOfArray(A,B) {
    //A complement B
    //A without B
    var result = A.slice();
    for (let i = 0; i < Object.keys(B).length; i++) {
        let index = B.indexOf()
        for (let j = 0; j < Object.keys(result).length; j++) {
            if (B[i] == result[j]){
                result.splice(j,1);
                break;
            }           
        }
    }
    return result;
}

function removeValueFromArray(array,value) {
    var result = [];
    for (let i = 0; i < Object.keys(result).length; i++){
        if (array[i] !== value){
            result.push(array[i]);
        }
    }
    return result;
}

class missing_values {
    constructor(board){
        this.arr = [];

        //init rows 0-9
        for (let i = 0; i < 9; i++) {
            this.arr[String(i)] = [];
            this.arr[String(col_names[i])] = [];
        }
        

        for (let x = 0; x < 9; x++) {
            //populate cols
            this.arr[String(col_names[x])] = getComplimentOfArray(perfectSet,board[x]).slice();

            //populate rows
            let temp = [];
            for (let y = 0; y < 9; y++) {
                temp.push(board[y][x]);
            }
            this.arr[String(x)] = getComplimentOfArray(perfectSet,temp).slice();
        }

        //init blocks as arrays
        for (let i = 0; i < 9; i++) {
            this.arr[String(block_names[i])] = [];
        }

        let iterator = 0;

        //iterating through the rows of the main 9x9 block
        for (let i = 0; i < 9; i = i+3) {
            //iterating through the columns of the main 9x9 block
            for (let j = 0; j < 9; j = j+3, iterator++) {
                //note board[i][j] is the top left single block in the 3x3

                //let counter = 0;

                let temp = [];

                //iterating through the rows of a 3x3 block
                for (let k = 0; k < 3; k++) {
                    //iterating through the columns of a 3x3 block
                    for (let l = 0; l < 3; l++) {
                        temp.push(board[j+l][i+k]);
                    }
                } 
                
                this.arr[String(block_names[iterator])] = getComplimentOfArray(perfectSet,temp);
            }
        }
    }
    count(){
        let result = 0;
        for (let i = 0; i < 9; i++) {
            result = result += Object.keys(this.arr[String(i)]).length;
        }
        return result;
    }
    updateForFoundValue(any_id,value,num_map){
        let y = 0;
        let x = 0;
        //note x is the position in the row & y is the position in the column

        if (block_names.includes(any_id)){
            //dealing with a block
            console.log("block_id given", any_id);

            let block_index = block_names.indexOf(any_id);
            //0..2 = top row, 3..5 = middle row, 6..8 = bottom row
            //0,3,6 = left col, 1,4,7 = middle col, 2,5,8 = right col

            if (block_index >= 0 && block_index <= 2){
                //top row
                y = 0;
            }
            else if (block_index >= 3 && block_index <= 5){
                //middle row
                y = 3;
            }
            else if (block_index >= 6 && block_index <= 8){
                //bottom row
                y = 6;
            }


            if (block_index === 0 || block_index === 3 || block_index === 6){
                //left col
                x = 0;
            }
            else if (block_index === 1 || block_index === 4 || block_index === 7){
                //middle col
                x = 3;
            }
            else if (block_index === 2 || block_index === 5 || block_index === 8){
                //right col
                x = 6;
            }

            //top-left is top left of the 3x3
            let y_from_top_left = 0;
            let x_from_top_left = 0;

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (num_map[x+i][y+j].getPotentialValues(this).includes(value)){
                        x_from_top_left = i;
                        y_from_top_left = j;
                    }
                }                
            }

            x = x + x_from_top_left;
            y = y + y_from_top_left;

        }
        else if (row_names.includes(any_id)){
            //dealing with a row
            console.log("row_id given", any_id);
            let z = parseInt(any_id);
            for (let i = 0; i < 9; i++) {
                if (num_map[i][z].getPotentialValues(this).includes(value)){
                    x = i;
                    break;
                }
            }
            y = parseInt(any_id,10);
        }
        else if (col_names.includes(any_id)){
            //dealing with a column
            console.log("col_id given", any_id);
            x = col_names.indexOf(any_id);
            for (let i = 0; i < 9; i++) {
                if (num_map[x][i].getPotentialValues(this).includes(value)){
                    y = i;
                    break;
                }
            }
        }

        console.log("value",value);
        console.log("x",x);
        console.log("y",y);

        let tempNum = num_map[x][y];

        let block = tempNum.block_id;
        let row = tempNum.row_id;
        let col = tempNum.col_id;

        //update row, col and block (remove from potential values)
        console.log("value",value);
        console.log("x",x);
        console.log("y",y);
        console.log("block_id",block);
        console.log("row_id",row);
        console.log("col_id",col);
        if (this.arr[String(y)].includes(value) && this.arr[getColID(x)].includes(value) && this.arr[String(block)].includes(value)){
            let temp = removeValueFromArray(this.arr[String(y)],value);
            this.arr[String(y)] = temp.slice();

            temp = removeValueFromArray(this.arr[getColID(x)],value);
            this.arr[getColID(x)] = temp.slice();

            temp = removeValueFromArray(this.arr[String(block)],value);
            this.arr[String(block)] = temp.slice();

            console.log([x,y]);
            return ([x,y]);
        }
        return null;
    }
}

/*
    we will create a data structure representing a single block called "num"

    that has
        3 properties holding the ids to each array
        its row & col position in 2d array of board
        the value of the block in question
        boolean value for whether it is empty or not
*/
class num{
    constructor(x,y,val){
        this.x = x;
        this.y = y;

        this.row_id = String(this.y);
        this.col_id = String(getColID(this.x));

        let xPos = Math.floor(x / 3);
        let yPos = Math.floor(y / 3);

        /*
            xPos = 0 => left column
            xPos = 1 => middle column
            xPos = 2 => right column
        */

        /*
            yPos = 0 => top row
            yPos = 1 => middle row
            yPos = 2 => bottom row
        */

        /*
        block name indices
            0   1   2
            3   4   5
            6   7   8
        */

        let xOptions = [];
        switch (xPos) {
            case 0:
                //either 0,3,6
                xOptions = [0,3,6];
                break;
            
            case 1:
                //either 1,4,7
                xOptions = [1,4,7];
                break;

            case 2:
                //either 2,5,8
                xOptions = [2,5,8];
                break;
        }

        let yOptions = [];
        switch (yPos) {
            case 0:
                //either 0,1,2
                yOptions = [0,1,2];
                break;
            
            case 1:
                //either 3,4,5
                yOptions = [3,4,5];
                break;  
                
            case 2:
                //either 6,7,8
                yOptions = [6,7,8];
                break;
        }

        /*
        thanks to Anon. from StackOverflow for this code that finds the intersection of two arrays
        https://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
        */
        const finalOption = xOptions.filter(value => yOptions.includes(value));
        if (Object.keys(finalOption).length > 0 && finalOption[0] >= 0 && finalOption[0] < 9){
            this.block_id = block_names[finalOption[0]];
        }
        else{
            alert("Something went wrong getting the block id.");
            this.block_id = "";
        }

        this.value = val;
    }
    getPotentialValues(missing){
        /*
            put together all of values missing in the block, col and row that num is in
            return them

            get all surrounding values (in block, col & row)
            invert them relative to perfectSet
        */
        if (this.value !== -1){
            return ([]);
        }

        console.log(this);

        let all_nearby_values = [];

        let temp1 = [...missing.arr[String(this.block_id)]];
        let temp2 = getComplimentOfArray(perfectSet,temp1);

        console.log(temp1);
        console.log(temp2);

        all_nearby_values.push(...temp2);

        temp1 = [...missing.arr[String(this.row_id)]];
        temp2 = getComplimentOfArray(perfectSet,temp1);

        console.log(temp1);
        console.log(temp2);

        all_nearby_values.push(...temp2);

        temp1 = [...missing.arr[String(this.col_id)]];
        temp2 = getComplimentOfArray(perfectSet,temp1);

        console.log(temp1);
        console.log(temp2);

        all_nearby_values.push(...temp2);

        let unique_nearby_values = [...new Set(all_nearby_values)];
        let unique_missing_nearby_values = getComplimentOfArray(perfectSet,Array.from(unique_nearby_values));
        console.log(unique_missing_nearby_values);
        return (unique_missing_nearby_values.slice());
    }
    isEmpty(){
        if (this.value === -1){
            return true;
        }
        return false;
    }
}

/*
    we will create a data structure called "table"
    which is a frequency table that checks a block, row or column

    that has
        function that returns true if there is a value with a freq of 1
        function that returns the value with a freq of 1
*/
class table{
    constructor(missing,id,num_map){
        console.log(id);
        this.arr = [];
        let all_vals = []; //all of the values that may work in each num in a row, col or block
        if (block_names.includes(id)){
            let block_index = block_names.indexOf(id);

            let x = 0;
            let y = 0;
            //(x,y) is the top-left most num in the block
            
            if (block_index >= 0 && block_index <= 2){
                //top row
                y = 0;
            }
            else if (block_index >= 3 && block_index <= 5){
                //middle row
                y = 3;
            }
            else if (block_index >= 6 && block_index <= 8){
                //bottom row
                y = 6;
            }


            if (block_index === 0 || block_index === 3 || block_index === 6){
                //left col
                x = 0;
            }
            else if (block_index === 1 || block_index === 4 || block_index === 7){
                //middle col
                x = 3;
            }
            else if (block_index === 2 || block_index === 5 || block_index === 8){
                //right col
                x = 6;
            }

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    let temp = [...num_map[x+i][y+j].getPotentialValues(missing)];
                    console.log(num_map[x+i][y+j]);
                    console.log("x",x+i,"y",x+j);
                    console.log(temp);
                    all_vals.push(...temp);
                }
            }
        }
        else if (row_names.includes(id)){
            //dealing with a row
            let index = parseInt(id,10); //the actual row

            for (let i = 0; i < 9; i++) {
                let temp = [...num_map[i][index].getPotentialValues(missing)];
                console.log(num_map[i][index]);
                console.log("x",i,"y",index);
                console.log(temp);
                all_vals.push(...temp);
            }
        }
        else if (col_names.includes(id)){
            //dealing with a column
            let index = col_names.indexOf(id);

            for (let i = 0; i < 9; i++) {
                let temp = [...num_map[index][i].getPotentialValues(missing)];
                console.log(num_map[index][i]);
                console.log("x",index,"y",i);
                console.log(temp);
                all_vals.push(...temp);
            }
        }

        console.log(all_vals);

        let items_to_count = [...new Set(all_vals)];
        console.log(items_to_count);
        for (let i = 0; i < Object.keys(items_to_count).length; i++) {
            this.arr[String(items_to_count[i])] = 0;
        }

        for (let i = 0; i < Object.keys(all_vals).length; i++){
            let temp = this.arr[String(all_vals[i])];
            temp++;
            this.arr[String(all_vals[i])] = temp;
        }

        console.log(this.arr);
    }
    goodOptionAvailable(){
        for (const key in this.arr){
            if (this.arr[key] === 1){
                return true;
            }
        }
        return false;
    }
    getGoodOption(){
        for (const key in this.arr){
            if (this.arr[key] === 1){
                return parseInt(key,10);
            }
        }
    }
}


/*
    when solve is called:
    make 2d array of nums (representing the board) called map
    //make an associative array with the ids of each row, col & block (3x9x9 = 3x81 = 243) called all
    create missing_values
    while (missing_values.count > 0):
        visually refresh board
        if (any item in missing values has only 1 item):
            use it
        else:
            get all potential values for each single block
            if (only 1 potential value):
                use it
            else:
                for (x in missing_values array):
                    create table using x
                    if (table has single missing value):
                        use it
                        break (from for loop)
*/
function solve(board) {
    var map = Array(9);
    for (let i = 0; i < 9; i++) {
        map[i] = Array(9);
        for (let j = 0; j < 9; j++) {
            map[i][j] = new num(i,j,board[i][j]);
        }        
    }

    var missing = new missing_values(board);
    console.log(missing.count());
    console.log(missing.arr);

    /*
    let A = [1,2,3,4,5,6,8,9];
    let B = [2,4,6,8];
    console.log(getComplimentOfArray(A,B));
    */

    let counter = 0;

    /*
    As per 'There is no 16-Clue Sudoku: Solving the Sudoku Minimum Number of Clues Problem'
    by McGuire, Tugemann and Civiario (https://arxiv.org/abs/1201.0749)

    there must be a minimum of 17 numbers in a Sudoku puzzle for it to be solved.
    hence, there cannot be more than 81 - 17 = 64 missing values in the puzzle
    */
    if (missing.count() > 64){
        alert("A Sudoku puzzle requires at least 17 numbers to achieve a unique solution");
        return;
    }

    while (missing.count() > 0 && counter < 500) {
        console.log(missing);
        counter++;

        console.log("missing count",missing.count());
        updateBoard(map);
        let found = false;
        /*
        let foundOneVal = false;
        for (var key in missing.arr){
            console.log("key",key);
            console.log("missing.arr[key]",missing.arr[key]);
            if (missing.arr[key].length === 1){
                foundOneVal = true;
                let foundVal = missing.arr[key][0];

                console.log("found a good value for " + String(key) + " since 1 val",foundVal);

                //use it
                xy = missing.updateForFoundValue(key,foundVal,map);
                let x = xy[0];
                let y = xy[1];
                map[x][y].value = foundVal;
                board[x][y] = foundVal;

                break;
            }
        }

        if (!foundOneVal){
            for (let i = 0; i < 9; i++){
                for (let j = 0; j < 9; j++){
                    let tempNum = map[i][j];
                    console.log(i,j);
                    console.log("tempNum",tempNum);
                    let temp = tempNum.getPotentialValues(missing);
                    console.log("tempNum's potential Values",temp);
                    if (temp.length === 1){
                        foundOneVal = true;
                        let foundVal = temp[0];

                        console.log("found a good value for " + String(tempNum.row_id) + " since only candidate for num",foundVal);

                        //use it
                        xy = missing.updateForFoundValue(tempNum.row_id,foundVal,map);
                        let x = xy[0];
                        let y = xy[1];
                        map[x][y].value = foundVal;
                        board[x][y] = foundVal;

                        break;
                    }
                }
                if (foundOneVal){
                    break;
                }
            }
        }

        if (!foundOneVal){
            for (var key in missing.arr){
                console.log(key);
                console.log(missing.arr[key]);
                let tempTable = new table(missing,key,map);
                console.log("got table");
                console.log(tempTable);
                console.log("tempTable.goodOptionAvailable()",tempTable.goodOptionAvailable());
                if (tempTable.goodOptionAvailable()){
                    let foundVal = tempTable.getGoodOption();

                    console.log("found a good value for " + String(key) + " using freq table",foundVal);

                    //use it
                    xy = missing.updateForFoundValue(key,foundVal,map);
                    let x = xy[0];
                    let y = xy[1];
                    map[x][y].value = foundVal;
                    board[x][y] = foundVal;

                    console.log("third test passed");
                    break;
                }
            }
        }
        */
        for (let i = 0; i < 9; i++){
            for (let j = 0; j < 9; j++){
                let tempNum = map[i][j];
                console.log(i,j);
                console.log("tempNum",tempNum);
                let temp = tempNum.getPotentialValues(missing);
                console.log("tempNum's potential Values",temp);
            }
        }

        for (var key in missing.arr){
            console.log(key);
            console.log(missing.arr[key]);
            let tempTable = new table(missing,key,map);
            console.log("got table");
            console.log(tempTable);
            console.log("tempTable.goodOptionAvailable()",tempTable.goodOptionAvailable());
            if (tempTable.goodOptionAvailable()){
                let foundVal = tempTable.getGoodOption();

                console.log("found a good value for " + String(key) + " using freq table",foundVal);

                //use it
                xy = missing.updateForFoundValue(key,foundVal,map);
                let x = xy[0];
                let y = xy[1];
                map[x][y].value = foundVal;
                board[x][y] = foundVal;

                found = true;

                console.log("third test passed");
                break;
            }
        }
    }
}

function updateBoard(nums) {
    for (let i = 0; i < 9; i++){
        for (let j = 0; j < 9; j++){
            let tempID = String(i+1) + "," + String(j+1);
            if (!givenValues.includes(tempID) && !nums[i][j].isEmpty()){
                const tempInput = document.getElementById(String(tempID));
                tempInput.value = parseInt(String(nums[i][j].value));
            }
        }
    }
}