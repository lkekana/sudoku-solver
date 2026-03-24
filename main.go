package main

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"slices"
	"strings"
	"time"

	"github.com/fatih/color"
)

// Grid represents a 9x9 Sudoku board (0 = empty)
type Grid [9][9]int
type AdjacencyMatrix [81][81]bool

var allowedOrigins = []string{
	"http://localhost:5173", // frontend origin
}

var adjMatrix, neighbors, graphDegrees = buildAdjacencyMatrix()

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

func (g Grid) canBeSolved() error {
	// A puzzle needs a minimum of 17 clues to have a unique solution (https://arxiv.org/abs/1201.0749)
	clueCount := 0
	for _, row := range g {
		for _, num := range row {
			if num != 0 {
				clueCount++
			}
			if num < 0 || num > 9 {
				return fmt.Errorf("Invalid number %d in grid", num)
			}
		}
	}
	if clueCount < 17 {
		return fmt.Errorf("Not enough clues (%d) to guarantee a unique solution", clueCount)
	}

	// Check for duplicate numbers in rows, columns, and boxes
	for i := 0; i < 9; i++ {
		rowSet := make(map[int]bool)
		colSet := make(map[int]bool)
		boxSet := make(map[int]bool)
		for j := 0; j < 9; j++ {
			// Check row
			x := g[i][j]
			if x != 0 {
				if rowSet[x] {
					return fmt.Errorf("Duplicate number %d found in row %d", x, i)
				}
				rowSet[x] = true
			}

			// Check column
			y := g[j][i]
			if y != 0 {
				if colSet[y] {
					return fmt.Errorf("Duplicate number %d found in column %d", y, i)
				}
				colSet[y] = true
			}

			// Check box
			boxRow, boxCol := 3*(i/3), 3*(i%3)
			z := g[boxRow+j/3][boxCol+j%3]
			if z != 0 {
				if boxSet[z] {
					return fmt.Errorf("Duplicate number %d found in box at row %d, column %d", z, boxRow, boxCol)
				}
				boxSet[z] = true
			}
		}
	}
	return nil
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

func corsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defaultOrigin := "http://localhost:5173"
		origin := r.Header.Get("Origin")
		if origin == "" {
			origin = defaultOrigin
		}
        w.Header().Set("Access-Control-Allow-Origin", origin)
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusNoContent)
            return
        }

        next.ServeHTTP(w, r)
    })
}

func solveHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	method := r.URL.Query().Get("method")
	if method != "backtracking" && method != "coloring" {
		method = "coloring"
	}

	var input struct {
		Grid Grid `json:"grid"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		fmt.Printf("Error decoding JSON: %v\n", err)
		http.Error(w, "Invalid grid format", http.StatusBadRequest)
		return
	}

	if err := input.Grid.canBeSolved(); err != nil {
		http.Error(w, "Puzzle cannot be solved: "+err.Error(), http.StatusUnprocessableEntity)
		return
	}

	var solution Grid
	var solved bool

	startTime := time.Now()
	if method == "backtracking" {
		solution, solved = backtrackingSolve(input.Grid)
	} else {
		solution, solved = coloringSolve(input.Grid)
	}
	endTime := time.Now()

	if !solved {
		http.Error(w, "No solution exists", http.StatusUnprocessableEntity)
		return
	}

	response := struct {
		Solution Grid `json:"solution"`
		SolveTime string `json:"solveTime"`
	}{
		Solution: solution,
		SolveTime: endTime.Sub(startTime).String(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func randomHandler(easyPuzzles, hardPuzzles, hardestPuzzles []Grid) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		difficulty := r.URL.Query().Get("difficulty")
		pool := []Grid{}
		if difficulty == "easy" {
			pool = easyPuzzles
		} else if difficulty == "hard" {
			pool = hardPuzzles
		} else if difficulty == "hardest" {
			pool = hardestPuzzles
		} else {
			// if no valid difficulty is provided, use all puzzles
			pool = append(pool, easyPuzzles...)
			pool = append(pool, hardPuzzles...)
			pool = append(pool, hardestPuzzles...)
		}

		poolSize := len(pool)
		startTime := time.Now()
		randomIndex, err := rand.Int(rand.Reader, big.NewInt(int64(poolSize)))
		if err != nil {
			http.Error(w, "Failed to generate random index", http.StatusInternalServerError)
			return
		}
		randomGrid := pool[randomIndex.Int64()]
		endTime := time.Now()
		log.Printf("Random puzzle generated in %s\n", endTime.Sub(startTime))

		response := struct {
			Grid Grid `json:"grid"`
		}{
			Grid: randomGrid,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}


func main() {
	// Alwaysdata sets IP and PORT env vars
	host := os.Getenv("IP")
	if host == "" {
		// host = "::" // fallback to IPv6 any
		host = "0.0.0.0"
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	fmt.Printf("Starting Sudoku solver server...\n")

	if len(os.Args) > 1 {
        if os.Args[1] == "test" {
			fmt.Printf("Testing solvers on sample puzzles...\n")
			test()
			return
		}
    }

	easyPuzzles := loadPuzzleFromFile("puzzles/easy50.txt")
	hardPuzzles := loadPuzzleFromFile("puzzles/top95.txt")
	hardestPuzzles := loadPuzzleFromFile("puzzles/hardest.txt")
	log.Printf("Loaded %d easy puzzles, %d hard puzzles, %d hardest puzzles\n", len(easyPuzzles), len(hardPuzzles), len(hardestPuzzles))

	// Serve static files (HTML/CSS/JS)
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", corsMiddleware(fs))
	http.Handle("/solve", corsMiddleware(http.HandlerFunc(solveHandler)))
	http.Handle("/random", corsMiddleware(http.HandlerFunc(randomHandler(easyPuzzles, hardPuzzles, hardestPuzzles))))
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})
	// log.Println("Server running at http://localhost:5000")
	// log.Fatal(http.ListenAndServe(":5000", nil))
	addr := host + ":" + port
	log.Printf("Server running at http://localhost:%s (listening on %s)\n", port, addr)
	log.Fatal(http.ListenAndServe(addr, nil))
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

// use Brelaz Graph Coloring algorithm to solve Sudoku
// we will use each digit (1-9) as a color
func coloringSolve(board Grid) (Grid, bool) {
	vertexSaturation := initVertexSaturation(board)
	uncoloredNeighborsDegree := initUncoloredNeighborsDegrees(board)
	return coloringSolveRecursive(board, vertexSaturation, uncoloredNeighborsDegree)
}

func coloringSolveRecursive(board Grid, vertexSaturation [81]int, uncoloredNeighborsDegree [81]int) (Grid, bool) {
	if board.colouringComplete() {
		return board, isValidGrid(board)
	}

	i := getBrelazVertex(vertexSaturation, uncoloredNeighborsDegree, board)
	availableColors := getAvailableColors(i, board)
	// availableColors := b_getAvailableColors(i, board)
	for _, color := range availableColors {
		newBoard := board
		row, col := i%9, i/9
		newBoard[col][row] = color

		newSaturation := vertexSaturation
		newDegree := uncoloredNeighborsDegree

		uncoloredNeighbors := getUncoloredNeighbors(i, board)
		// uncoloredNeighbors := b_getUncoloredNeighbors(i, board)
		for _, u := range uncoloredNeighbors {
			uNeighborColors := getNeighborColors(u, board)
			// uNeighborColors := b_getNeighborColors(u, board)
			if !slices.Contains(uNeighborColors, color) {
				newSaturation[u]++
			}
			newDegree[u]--
		}

		if solvedBoard, ok := coloringSolveRecursive(newBoard, newSaturation, newDegree); ok {
			return solvedBoard, true
		}

	}
	return board, false
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

func buildAdjacencyMatrix() (AdjacencyMatrix, [81][]int, [81]int) {
	var adjMatrix AdjacencyMatrix
	var neighbors [81][]int
	var degrees [81]int
	for row := 0; row < 9; row++ {
		for col := 0; col < 9; col++ {
			idx := row*9 + col
			// Row and column neighbors
			for i := 0; i < 9; i++ {
				if !adjMatrix[idx][row*9+i] {
                    adjMatrix[idx][row*9+i] = true
                    neighbors[idx] = append(neighbors[idx], row*9+i)
                    degrees[idx]++
                }
                if !adjMatrix[idx][i*9+col] {
                    adjMatrix[idx][i*9+col] = true
                    neighbors[idx] = append(neighbors[idx], i*9+col)
                    degrees[idx]++
                }
			}
			// Box neighbors
			boxRow, boxCol := 3*(row/3), 3*(col/3)
			for i := 0; i < 3; i++ {
				for j := 0; j < 3; j++ {
					r, c := boxRow+i, boxCol+j
					if !adjMatrix[idx][r*9+c] {
                        adjMatrix[idx][r*9+c] = true
                        neighbors[idx] = append(neighbors[idx], r*9+c)
                        degrees[idx]++
                    }
				}
			}
			adjMatrix[idx][idx] = false // a vertex is not adjacent to itself
		}
	}
	return adjMatrix, neighbors, degrees
}

func initUncoloredNeighborsDegrees(board Grid) [81]int {
	degrees := graphDegrees
	for i := 0; i < 81; i++ {
		row, col := i % 9, i / 9
		if board[col][row] != 0 {
			neighbors := getNeighbors(i)
			for _, neighbor := range neighbors {
				degrees[neighbor]--
			}
		}
	}
	return degrees
}

func initVertexSaturation(board Grid) [81]int {
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

func getAvailableColors(vertex int, board Grid) []int {
	colorUsed := [9]bool{}
	neighbors := getNeighbors(vertex)
	for _, neighbor := range neighbors {
		row, col := neighbor%9, neighbor/9
		color := board[col][row]
		if color != 0 {
			colorUsed[color-1] = true
		}
	}
	availableColors := []int{}
	for color := 0; color < 9; color++ {
		if !colorUsed[color] {
			availableColors = append(availableColors, color+1)
		}
	}
	return availableColors
}

// optimized version of getAvailableColors using bitmasking
func b_getAvailableColors(vertex int, board Grid) []int {
    // Use a bitmask to track used colors (1-9)
    var colorMask uint16 = 0
    neighbors := getNeighbors(vertex)

    // Mark colors used by neighbors
    for _, neighbor := range neighbors {
        row, col := neighbor%9, neighbor/9
        color := board[col][row]
        if color != 0 {
            colorMask |= (1 << (color - 1)) // Set the bit for the used color
        }
    }

    // Collect available colors
    availableColors := []int{}
    for color := 1; color <= 9; color++ {
        if colorMask&(1<<(color-1)) == 0 { // Check if the bit for this color is not set
            availableColors = append(availableColors, color)
        }
    }

    return availableColors
}

func getNeighbors(vertex int) []int {
	return neighbors[vertex]
}

func getNeighborColors(vertex int, board Grid) []int {
	colors := []int{}
	neighbors := getNeighbors(vertex)
	for _, neighbor := range neighbors {
		row, col := neighbor%9, neighbor/9
		color := board[col][row]
		if color != 0 {
			colors = append(colors, color)
		}
	}
	return colors
}

// optimized version of getNeighborColors using bitmasking
func b_getNeighborColors(vertex int, board Grid) []int {
    // Use a bitmask to track used colors (1-9)
    var colorMask uint16 = 0
    neighbors := getNeighbors(vertex)

    for _, neighbor := range neighbors {
        row, col := neighbor%9, neighbor/9
        color := board[col][row]
        if color != 0 {
            colorMask |= (1 << (color - 1)) // Set the bit for the used color
        }
    }

    // Collect used colors
	usedColors := []int{}
	for color := 1; color <= 9; color++ {
		if colorMask&(1<<(color-1)) != 0 { // Check if the bit for this color is set
			usedColors = append(usedColors, color)
		}
	}
	return usedColors
}

func getUncoloredNeighbors(vertex int, board Grid) []int {
	uncoloredNeighbors := []int{}
	neighbors := getNeighbors(vertex)
	for _, neighbor := range neighbors {
		row, col := neighbor%9, neighbor/9
		if board[col][row] == 0 {
			uncoloredNeighbors = append(uncoloredNeighbors, neighbor)
		}
	}
	return uncoloredNeighbors
}

// optimized version of getUncoloredNeighbors using bitmasking
func b_getUncoloredNeighbors(vertex int, board Grid) []int {
    // Use a bitmask to track uncolored neighbors
    var uncoloredMask uint32 = 0
    neighbors := getNeighbors(vertex)

    for _, neighbor := range neighbors {
        row, col := neighbor%9, neighbor/9
        if board[col][row] == 0 {
            uncoloredMask |= (1 << neighbor) // Set the bit for the uncolored neighbor
        }
    }

    // Collect uncolored neighbors
	uncoloredNeighbors := []int{}
	for neighbor := 0; neighbor < 81; neighbor++ {
		if uncoloredMask&(1<<neighbor) != 0 { // Check if the bit for this neighbor is set
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

func loadPuzzleFromFile(filePath string) []Grid {
	result := []Grid{}
	f, err := os.ReadFile(filePath)
	if err != nil {
		log.Fatal(err)
	}
	rows := strings.Split(strings.TrimSpace(string(f)), "\n")
    for _, raw := range rows {
		row := strings.TrimSpace(raw)
		if len(row) != 81 {
			continue // skip invalid rows
		}
		var grid Grid
		wellFormed := true
		for i, ch := range row {
			if ch == '.' || ch == '0' {
				grid[i/9][i%9] = 0
			} else if ch >= '1' && ch <= '9' {
				grid[i/9][i%9] = int(ch - '0')
			} else {
				log.Printf("Invalid character '%c' in puzzle, skipping...\n", ch)
				wellFormed = false
				continue
			}
		}
		if wellFormed {
			result = append(result, grid)
		}
	}
	return result
}

func test() {
	easyPuzzles := loadPuzzleFromFile("puzzles/easy50.txt")
	hardPuzzles := loadPuzzleFromFile("puzzles/top95.txt")
	hardestPuzzles := loadPuzzleFromFile("puzzles/hardest.txt")

	totalPuzzleCount := len(easyPuzzles) + len(hardPuzzles) + len(hardestPuzzles)
	fmt.Printf("\n\nSolving %d Sudoku puzzles via backtracking...\n", totalPuzzleCount)
	backtrackingResultsArray := make([]struct {
		solution Grid
		solved   bool
		duration time.Duration
	}, totalPuzzleCount)

	i := 0
	easyDuration := 0
	for _, grid := range easyPuzzles {
		startTime := time.Now()
		solution, solved := backtrackingSolve(grid)
		endTime := time.Now()
		duration := endTime.Sub(startTime)
		easyDuration += int(duration.Nanoseconds())
		backtrackingResultsArray[i] = struct {
			solution Grid
			solved   bool
			duration time.Duration
		}{
			solution: solution,
			solved:   solved,
			duration: duration,
		};
		// log.Printf("Grid %d solved: %t, Time taken: %s\n", i+1, solved, duration)
		i++
	}

	hardDuration := 0
	for _, grid := range hardestPuzzles {
		startTime := time.Now()
		solution, solved := backtrackingSolve(grid)
		endTime := time.Now()
		duration := endTime.Sub(startTime)
		hardDuration += int(duration.Nanoseconds())
		backtrackingResultsArray[i] = struct {
			solution Grid
			solved   bool
			duration time.Duration
		}{
			solution: solution,
			solved:   solved,
			duration: duration,
		};
		// log.Printf("Grid %d solved: %t, Time taken: %s\n", i+1, solved, duration)
		i++
	}

	hardestDuration := 0
	for _, grid := range easyPuzzles {
		startTime := time.Now()
		solution, solved := backtrackingSolve(grid)
		endTime := time.Now()
		duration := endTime.Sub(startTime)
		hardestDuration += int(duration.Nanoseconds())
		backtrackingResultsArray[i] = struct {
			solution Grid
			solved   bool
			duration time.Duration
		}{
			solution: solution,
			solved:   solved,
			duration: duration,
		};
		// log.Printf("Grid %d solved: %t, Time taken: %s\n", i+1, solved, duration)
		i++
	}

	println("\033[1mBacktracking results:\033[0m")
	easyAvgDuration := time.Duration(easyDuration / len(easyPuzzles))
	hardAvgDuration := time.Duration(hardDuration / len(hardPuzzles))
	hardestAvgDuration := time.Duration(hardestDuration / len(hardestPuzzles))
	coloringDuration := easyDuration + hardDuration + hardestDuration
	fmt.Printf("> %d %s puzzles solved in %s   \t (average time: %s)\n", len(easyPuzzles), color.GreenString("easy"), time.Duration(easyDuration), easyAvgDuration)
	fmt.Printf("> %d %s puzzles solved in %s   \t (average time: %s)\n", len(hardPuzzles), color.YellowString("hard"), time.Duration(hardDuration), hardAvgDuration)
	fmt.Printf("> %d %s puzzles solved in %s   \t (average time: %s)\n", len(hardestPuzzles), color.RedString("hardest"), time.Duration(hardestDuration), hardestAvgDuration)

	println()

	fmt.Printf("\nSolving %d Sudoku puzzles via graph coloring...\n", totalPuzzleCount)
	coloringResultsArray := make([]struct {
		solution Grid
		solved   bool
		duration time.Duration
	}, totalPuzzleCount)

	i = 0
	easyDuration = 0
	for _, grid := range easyPuzzles {
		startTime := time.Now()
		solution, solved := coloringSolve(grid)
		endTime := time.Now()
		duration := endTime.Sub(startTime)
		easyDuration += int(duration.Nanoseconds())
		coloringResultsArray[i] = struct {
			solution Grid
			solved   bool
			duration time.Duration
		}{
			solution: solution,
			solved:   solved,
			duration: duration,
		};
		// log.Printf("Grid %d solved: %t, Time taken: %s\n", i+1, solved, duration)
		i++
	}

	hardDuration = 0
	for _, grid := range hardPuzzles {
		startTime := time.Now()
		solution, solved := coloringSolve(grid)
		endTime := time.Now()
		duration := endTime.Sub(startTime)
		hardDuration += int(duration.Nanoseconds())
		coloringResultsArray[i] = struct {
			solution Grid
			solved   bool
			duration time.Duration
		}{
			solution: solution,
			solved:   solved,
			duration: duration,
		};
		// log.Printf("Grid %d solved: %t, Time taken: %s\n", i+1, solved, duration)
		i++
	}

	hardestDuration = 0
	for _, grid := range hardestPuzzles {
		startTime := time.Now()
		solution, solved := coloringSolve(grid)
		endTime := time.Now()
		duration := endTime.Sub(startTime)
		hardestDuration += int(duration.Nanoseconds())
		coloringResultsArray[i] = struct {
			solution Grid
			solved   bool
			duration time.Duration
		}{
			solution: solution,
			solved:   solved,
			duration: duration,
		};
		// log.Printf("Grid %d solved: %t, Time taken: %s\n", i+1, solved, duration)
		i++
	}

	println("\033[1mGraph coloring results:\033[0m")
	easyAvgDuration = time.Duration(easyDuration / len(easyPuzzles))
	hardAvgDuration = time.Duration(hardDuration / len(hardPuzzles))
	hardestAvgDuration = time.Duration(hardestDuration / len(hardestPuzzles))
	backtrackingDuration := easyDuration + hardDuration + hardestDuration
	fmt.Printf("> %d %s puzzles solved in %s   \t (average time: %s)\n", len(easyPuzzles), color.GreenString("easy"), time.Duration(easyDuration), easyAvgDuration)
	fmt.Printf("> %d %s puzzles solved in %s   \t (average time: %s)\n", len(hardPuzzles), color.YellowString("hard"), time.Duration(hardDuration), hardAvgDuration)
	fmt.Printf("> %d %s puzzles solved in %s   \t (average time: %s)\n", len(hardestPuzzles), color.RedString("hardest"), time.Duration(hardestDuration), hardestAvgDuration)

	ratio := float64(coloringDuration) / float64(backtrackingDuration)
	fmt.Printf("\nOverall, graph coloring was faster than backtracking by a factor of %.2f\n\n\n", ratio)
}