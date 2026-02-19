import { useState } from "react";
import ClearButton from "../components/ClearButton";
import Footer from "../components/Footer";
import Grid from "../components/Grid";
import Header from "../components/Header";
import SolveButton from "../components/SolveButton";
import LoadButton from "../components/LoadButton";

export type CellState = {
	value: number;
	isGiven: boolean;
	clear: boolean;
};

export default function Home() {
	const [grid, setGrid] = useState<CellState[]>(Array(81).fill({ value: 0, isGiven: false, clear: false }));
	const [solveTime, setSolveTime] = useState<string | undefined>(undefined);
	const numValChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
		// update state here
		const inputValue = e.target.value;
		const inputID = e.target.id;
		if (
			inputValue.length === 1 &&
			/^[1-9]$/.test(inputValue) &&
			/^[0-8],[0-8]$/.test(inputID)
		) {
			const row = parseInt(inputID[0]);
			const col = parseInt(inputID[2]);
			const index = row * 9 + col;
			const newGrid = [...grid];
			newGrid[index] = {
				value: parseInt(inputValue),
				isGiven: true,
				clear: false,
			};
			setGrid(newGrid);
		} else {
			e.target.value = "";
		}
	};

	const btnSolveClick = () => {
		// trigger solve
		let clueCount = 0;
		const payload: number[][] = [];
		for (let i = 0; i < 9; i++) {
			const row: number[] = [];
			for (let j = 0; j < 9; j++) {
				row.push(grid[i * 9 + j].value);
				if (grid[i * 9 + j].value !== 0) {
					clueCount++;
				}
			}
			payload.push(row);
		}

		if (clueCount < 17) {
			alert(
				"At least 17 clues are required for a valid Sudoku puzzle. Please add more numbers.",
			);
			return;
		}

		fetch("http://localhost:5000/solve", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ grid: payload }),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.solution) {
					const solution: number[][] = data.solution;
					const newGrid: CellState[] = [];
					for (let i = 0; i < 9; i++) {
						for (let j = 0; j < 9; j++) {
							const index = i * 9 + j;
							newGrid.push({
								value: solution[i][j],
								isGiven: grid[index].isGiven,
								clear: false,
							});
						}
					}
					setGrid(newGrid);
					if (data.solveTime) {
						setSolveTime(data.solveTime);
					}
				} else {
					alert("No solution found for the given puzzle.");
				}
			})
			.catch((error) => {
				console.error("Error solving the puzzle:", error);
				alert(
					"An error occurred while solving the puzzle. Please try again.",
				);
			});
	};

	const btnLoadClick = () => {
		fetch("http://localhost:5000/random")
			.then((response) => response.json())
			.then((data) => {
				if (data.grid) {
					const puzzle: number[][] = data.grid;
					const newGrid: CellState[] = [];
					for (let i = 0; i < 9; i++) {
						for (let j = 0; j < 9; j++) {
							newGrid.push({
								value: puzzle[i][j],
								isGiven: puzzle[i][j] !== 0,
								clear: false,
							});
						}
					}
					setGrid(newGrid);
					setSolveTime(undefined);
				} else {
					alert("Failed to load a random puzzle.");
				}
			})
			.catch((error) => {
				console.error("Error loading random puzzle:", error);
				alert(
					"An error occurred while loading a random puzzle. Please try again.",
				);
			});
	};

	const btnClearClick = () => {
		// clear inputs
		setGrid(Array(81).fill({ value: 0, isGiven: false, clear: false }));
		setSolveTime(undefined);
	};

	return (
		<>
			<Header />

			<div className="px-4 my-1 text-center">
				<h1 className="display-5 fw-bold"></h1>
				<div className="col-lg-6 mx-auto">
					<p className="lead mb-2">
						Enter the numbers in the puzzle & click on 'Solve' to
						the see the solution.
					</p>
					<Grid cellChangeFn={numValChanged} grid={grid} />
					{solveTime && (
						<p className="mt-2">
							Solved in <strong>{solveTime}</strong> seconds!
						</p>
					)}

					<div className="mt-2 d-grid gap-2 d-sm-flex justify-content-sm-center">
						<SolveButton onClickFn={btnSolveClick} />
						<ClearButton onClickFn={btnClearClick} />
						<LoadButton onClickFn={btnLoadClick} />
					</div>
				</div>
			</div>

			<Footer />
		</>
	);
}
