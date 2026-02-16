package main

import (
	"fmt"
	"log"
	"os"
	"slices"
	"strings"
	"time"
)

// Grid represents a 9x9 Sudoku board (0 = empty)
type Grid [9][9]int
type AdjacencyMatrix [81][81]bool

func (g Grid) String() string {
	var sb strings.Builder
	for i, row := range g {
		for j, num := range row {
			if num == 0 {
				sb.WriteRune('.')
			} else {
				sb.WriteString(string(rune(num + '0')))
			}
			sb.WriteRune(' ')
			if j % 3 == 2 && j != 8 {
				sb.WriteRune('\t')
			}
		}
		sb.WriteRune('\n')
		if i % 3 == 2 && i != 8 {
			sb.WriteRune('\n')
		}
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

func (g Grid) colouringComplete() bool {
	for _, row := range g {
		for _, num := range row {
			if num == 0 {
				return false
			}
		}
	}
	return true
}

func (m AdjacencyMatrix) String() string {
	var sb strings.Builder
	for i := 0; i < 81; i++ {
		for j := 0; j < 81; j++ {
			if m[i][j] {
				sb.WriteRune('1')
			} else {
				sb.WriteRune('0')
			}
		}
		sb.WriteRune('\n')
	}
	return sb.String()
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

// use Brelaz Graph Coloring algorithm to solve Sudoku (not as efficient as backtracking for standard puzzles, but interesting to implement)
// we will use each digit (1-9) as a color
func coloringSolve(board Grid) (Grid, bool) {
	// fmt.Printf("Initial board state:\n%s\n", board.String())
	adjMatrix := buildAdjacencyMatrix(board)
	vertexSaturation := initVertexSaturation(adjMatrix, board)
	uncoloredNeighborsDegree := initUncoloredNeighborsDegrees(adjMatrix, board)

	// while not all vertices are colored
	for !board.colouringComplete() {
		// fmt.Printf("Current board state:\n%s\n", board.String())
		// fmt.Printf("Current vertex saturation: %v\n", vertexSaturation)
		// fmt.Printf("Current uncolored neighbors degree: %v\n", uncoloredNeighborsDegree)
		i := getBrelazVertex(vertexSaturation, uncoloredNeighborsDegree, board)
		// fmt.Printf("Selected vertex %d(row %d, col %d) with saturation %d and uncolored neighbors degree %d\n", i, i%9, i/9, vertexSaturation[i], uncoloredNeighborsDegree[i])
		j := getSmallestAvailableColor(i, adjMatrix, board)
		// fmt.Printf("Smallest available color for vertex %d(row %d, col %d) is %d\n", i, i%9, i/9, j)
		if j == -1 {
			// fmt.Printf("Current board state:\n%s\n", board.String())
			panic("No available color for vertex " + fmt.Sprint(i))
		}
		uncoloredNeighbors := getUncoloredNeighbors(i, adjMatrix, board)
		for _, u := range uncoloredNeighbors {
			uNeightborColors := getNeighborColors(u, adjMatrix, board)
			if !slices.Contains(uNeightborColors, j) {
				vertexSaturation[u]++
			}
			uncoloredNeighborsDegree[u]--
		}

		// color vertex i with color j
		row, col := i%9, i/9
		board[col][row] = j
	}
	return board, isValidGrid(board)
}

func getBrelazVertex(vertexSaturation [81]int, uncoloredNeighbors [81]int, board Grid) int {
	maxVertexSaturation := -1
	maxUncoloredNeighbors := -1
	selectedVertex := -1

	for i := 0; i < 81; i++ {
		row, col := i%9, i/9
		if board[col][row] != 0 {
			continue // skip already colored vertices
		}
		if vertexSaturation[i] > maxVertexSaturation || (vertexSaturation[i] == maxVertexSaturation && uncoloredNeighbors[i] > maxUncoloredNeighbors) {
			maxVertexSaturation = vertexSaturation[i]
			maxUncoloredNeighbors = uncoloredNeighbors[i]
			selectedVertex = i
		}
	}
	return selectedVertex
}

func buildAdjacencyMatrix(board Grid) AdjacencyMatrix {
	var adjMatrix AdjacencyMatrix
	for row := 0; row < 9; row++ {
		for col := 0; col < 9; col++ {
			idx := row*9 + col
			// Row and column neighbors
			for i := 0; i < 9; i++ {
				adjMatrix[idx][row*9+i] = true
				adjMatrix[idx][i*9+col] = true
			}
			// Box neighbors
			boxRow, boxCol := 3*(row/3), 3*(col/3)
			for i := 0; i < 3; i++ {
				for j := 0; j < 3; j++ {
					r, c := boxRow+i, boxCol+j
					adjMatrix[idx][r*9+c] = true
				}
			}
			adjMatrix[idx][idx] = false // a vertex is not adjacent to itself
		}
	}
	return adjMatrix
}

func getGraphDegrees(adjMatrix AdjacencyMatrix) [81]int {
	var degrees [81]int
	for i := 0; i < 81; i++ {
		for j := 0; j < 81; j++ {
			if adjMatrix[i][j] {
				degrees[i]++
			}
		}
	}
	return degrees
}

func initUncoloredNeighborsDegrees(adjMatrix AdjacencyMatrix, board Grid) [81]int {
	degrees := getGraphDegrees(adjMatrix)
	for i := 0; i < 81; i++ {
		row, col := i % 9, i / 9
		if board[col][row] != 0 {
			neighbors := getNeighbors(i, adjMatrix)
			for _, neighbor := range neighbors {
				degrees[neighbor]--
			}
		}
	}
	return degrees
}

func initVertexSaturation(adjMatrix AdjacencyMatrix, board Grid) [81]int {
	var vertexSaturation [81]int
	for i := 0; i < 81; i++ {
		usedColors := [10]bool{}
        for j := 0; j < 81; j++ {
            if adjMatrix[i][j] {
                c := board[j/9][j%9]
                if c != 0 {
                    usedColors[c] = true
                }
            }
        }

        // count unique colors
        count := 0
        for c := 1; c <= 9; c++ {
            if usedColors[c] {
                count++
            }
        }
        vertexSaturation[i] = count
	}
	return vertexSaturation
}

func getSmallestAvailableColor(vertex int, adjMatrix AdjacencyMatrix, board Grid) int {
	// fmt.Printf("Getting smallest available color for vertex %d(row %d, col %d)\n", vertex, vertex%9, vertex/9)
	colorUsed := [9]bool{}
	neighbors := getNeighbors(vertex, adjMatrix)
	for _, neighbor := range neighbors {
		row, col := neighbor%9, neighbor/9
		color := board[col][row]
		// fmt.Printf("Neighbor vertex: %d(row %d, col %d) color: %d\n", neighbor, neighbor%9, neighbor/9, color)
		if color != 0 {
			colorUsed[color-1] = true
		}
	}
	for color := 0; color < 9; color++ {
		if !colorUsed[color] {
			return color + 1
		}
	}
	return -1 // no available color
}

func getNeighbors(vertex int, adjMatrix AdjacencyMatrix) []int {
	neighbors := []int{}
	for i := 0; i < 81; i++ {
		if adjMatrix[vertex][i] {
			neighbors = append(neighbors, i)
		}
	}
	return neighbors
}

func getNeighborColors(vertex int, adjMatrix AdjacencyMatrix, board Grid) []int {
	colors := []int{}
	neighbors := getNeighbors(vertex, adjMatrix)
	for _, neighbor := range neighbors {
		row, col := neighbor%9, neighbor/9
		color := board[col][row]
		if color != 0 {
			colors = append(colors, color)
		}
	}
	return colors
}

func getUncoloredNeighbors(vertex int, adjMatrix AdjacencyMatrix, board Grid) []int {
	uncoloredNeighbors := []int{}
	neighbors := getNeighbors(vertex, adjMatrix)
	for _, neighbor := range neighbors {
		row, col := neighbor%9, neighbor/9
		if board[col][row] == 0 {
			uncoloredNeighbors = append(uncoloredNeighbors, neighbor)
		}
	}
	return uncoloredNeighbors
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


	log.Printf("Solving %d Sudoku puzzles via backtracking...\n", len(grids))
	backtrackingResultsArray := make([]struct {
		solution Grid
		solved   bool
		duration time.Duration
	}, len(grids))

	for i, grid := range grids {
		startTime := time.Now()
		solution, solved := backtrackingSolve(grid)
		endTime := time.Now()
		duration := endTime.Sub(startTime)
		backtrackingResultsArray[i] = struct {
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
	for _, result := range backtrackingResultsArray {
		totalDuration += int(result.duration.Nanoseconds())
	}
	avgDuration := time.Duration(totalDuration / len(backtrackingResultsArray))
	log.Printf("Average time taken per puzzle: %s\n", avgDuration)

	println()

	log.Printf("Solving %d Sudoku puzzles via graph coloring...\n", len(grids))
	coloringResultsArray := make([]struct {
		solution Grid
		solved   bool
		duration time.Duration
	}, len(grids))

	for i, grid := range grids {
		startTime := time.Now()
		solution, solved := coloringSolve(grid)
		endTime := time.Now()
		duration := endTime.Sub(startTime)
		coloringResultsArray[i] = struct {
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

	totalDuration = 0
	for _, result := range coloringResultsArray {
		totalDuration += int(result.duration.Nanoseconds())
	}
	avgDuration = time.Duration(totalDuration / len(coloringResultsArray))
	log.Printf("Average time taken per puzzle: %s\n", avgDuration)
	// println("Is the solution valid?", isValidGrid(solution))
}