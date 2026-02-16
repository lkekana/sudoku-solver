package main

import (
	"log"
	"os"
	"slices"
	"strings"
	"time"
)

// Grid represents a 9x9 Sudoku board (0 = empty)
type Grid [9][9]int

func (g Grid) String() string {
	var sb strings.Builder
	for _, row := range g {
		for _, num := range row {
			if num == 0 {
				sb.WriteRune('.')
			} else {
				sb.WriteString(string(rune(num + '0')))
			}
		}
		sb.WriteRune('\n')
	}
	return sb.String()
}

func (g Grid) canBeSolved() bool {
	// A puzzle needs a minimum of 17 clues to have a unique solution (https://arxiv.org/abs/1201.0749)
	clueCount := 0
	for _, row := range g {
		for _, num := range row {
			if num != 0 {
				clueCount++
			}
		}
	}
	if clueCount < 17 {
		return false
	}
	return true
}

func main() {
	test()
}

// Backtracking solver (efficient for standard Sudoku)
func backtrackingSolve(board Grid) (Grid, bool) {
	for row := 0; row < 9; row++ {
		for col := 0; col < 9; col++ {
			if board[row][col] == 0 {
				for num := 1; num <= 9; num++ {
					if isValidOption(board, row, col, num) {
						board[row][col] = num

						if solvedBoard, ok := backtrackingSolve(board); ok {
							return solvedBoard, true
						}
						board[row][col] = 0 // backtrack
					}
				}
				return board, false
			}
		}
	}
	return board, true
}

func isValidOption(board Grid, row, col, num int) bool {
	// Check row/col
	for i := 0; i < 9; i++ {
		if board[row][i] == num || board[i][col] == num {
			return false
		}
	}
	// Check 3x3 box
	boxRow, boxCol := 3*(row/3), 3*(col/3)
	for i := 0; i < 3; i++ {
		for j := 0; j < 3; j++ {
			if board[boxRow+i][boxCol+j] == num {
				return false
			}
		}
	}
	return true
}

func isValidGrid(board Grid) bool {
	for row := 0; row < 9; row++ {
		tmp := board[row]
		// fmt.Println("Row values:", tmp)
		slices.Sort(tmp[:])
		for i := 0; i < 9; i++ {
			if tmp[i] != i+1 {
				return false
			}
		}

		// check columns simultaneously
		tmp = [9]int{}
		for i := 0; i < 9; i++ {
			tmp[i] = board[i][row]
		}
		// fmt.Println("Column values:", tmp)
		slices.Sort(tmp[:])
		for i := 0; i < 9; i++ {
			if tmp[i] != i+1 {
				return false
			}
		}

		// check 3x3 boxes
		tmp = [9]int{}
		x := 0
		for i := 0; i < 3; i++ {
			for j := 0; j < 3; j++ {
				tmp[x] = board[3*(row/3)+i][3*(row%3)+j]
				x++
			}
		}
		// fmt.Println("Box values:", tmp)
		slices.Sort(tmp[:])
		for i := 0; i < 9; i++ {
			if tmp[i] != i+1 {
				return false
			}
		}
		// println()
	}
	return true
}

func test() {
	// Test puzzles from github.com/dimitri/sudoku
	f, err := os.ReadFile("sudoku.txt")
	if err != nil {
		log.Fatal(err)
	}

	var grids []Grid
	rows := strings.Split(strings.TrimSpace(string(f)), "\n")
	var lineCount int = 0
	var gridCount int = 0
	var tmpGrid Grid
    for _, raw := range rows {
        row := strings.TrimSpace(raw)
		if strings.HasPrefix(row, "Grid") {
			tmpGrid = Grid{} // reset grid for new puzzle
			continue
		}
        if len(row) != 9 {
            continue // skip invalid rows
        }
        i := 0
        for _, ch := range row {
            if i >= 9 {
                break
            }
            if ch >= '0' && ch <= '9' {
                tmpGrid[lineCount][i] = int(ch - '0')
            } else {
                tmpGrid[lineCount][i] = 0
            }
            i++
        }
		lineCount++
		if lineCount == 9 {
			if !tmpGrid.canBeSolved() {
				log.Printf("Grid %d has less than 17 clues (multiple solutions possible) skipping...\n", gridCount+1)
			} else {
				grids = append(grids, tmpGrid)
				gridCount++
			}
			lineCount = 0
		}
    }


	log.Printf("Solving %d Sudoku puzzles...\n", len(grids))
	resultsArray := make([]struct {
		solution Grid
		solved   bool
		duration time.Duration
	}, len(grids))

	for i, grid := range grids {
		startTime := time.Now()
		solution, solved := backtrackingSolve(grid)
		endTime := time.Now()
		duration := endTime.Sub(startTime)
		resultsArray[i] = struct {
			solution Grid
			solved   bool
			duration time.Duration
		}{
			solution: solution,
			solved:   solved,
			duration: duration,
		};
		log.Printf("Grid %d solved: %t, Time taken: %s\n", i+1, solved, duration)
	}

	totalDuration := 0
	for _, result := range resultsArray {
		totalDuration += int(result.duration.Nanoseconds())
	}
	avgDuration := time.Duration(totalDuration / len(resultsArray))
	log.Printf("Average time taken per puzzle: %s\n", avgDuration)
	// println("Is the solution valid?", isValidGrid(solution))
}