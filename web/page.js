var canEdit = true;

var givenValues = [];

//init
    var inputValues = new Array(9);
    for (let x = 0; x < 9; x++) {
        inputValues[x] = new Array(9);
        for (let y = 0; y < 9; y++) {
            inputValues[x][y] = -1;
        }
    }
    btnClearClick();

    //make editable from start
    const collection = document.getElementsByClassName("num-input");
    for (let i = 0; i < collection.length; i++) {
        collection[i].readOnly = false;
    }

function validInput(input){
    if (input.length == 1){
        var isDigit = false;
        for (let i = 0; i <= 9; i++) {
            if (input === String(i))    {
                isDigit = true;
            }  
        }
        if (isDigit){
            return true;
        }
    }
    return false;
}

function btnSolveClick() {

    const collection = document.getElementsByClassName("num-input");
    for (let i = 0; i < collection.length; i++) {
        collection[i].readOnly = true;
        if (collection[i].value != ""){
            givenValues.push(collection[i].id);
            collection[i].style.fontWeight = 'bold';
        }
        else{
            collection[i].style.fontWeight = '';
        }
    }

    /*
        in order to solve the sudoku puzzle, i think we should:
        1. find the potential values for each empty block (updatePotentials) into a huge array
        2. sort the huge array by fewest values
        3. if:
            i. there's a value with only 1 potential
                then: add that value as a solution (and repeat)
            ii. else
                try one value and proceed
        4. if there's an error (likely caused by a bad pick)
            then: step back
            else: (repeat)

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
    //console.log(inputValues);
    solve(inputValues);
}

function btnClearClick() {
    const collection = document.getElementsByClassName("num-input");
    for (let i = 0; i < collection.length; i++) {
        collection[i].value = "";
        collection[i].style.fontWeight = '';
        collection[i].readOnly = false;
    }

    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            inputValues[x][y] = -1;
        }
    }
}

function numValChanged(element) {

    if (validInput(String(element.value))){
        //if valid, save to matrix
        var idStr = String(element.id);

        var x = parseInt(idStr[0]);
        var y = parseInt(idStr[2]);

        inputValues[x-1][y-1] = parseInt(element.value);
    }
    else{
        element.value = "";
    }

    givenValues = [];
    
}