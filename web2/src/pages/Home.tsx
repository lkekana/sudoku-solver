import { useEffect, useMemo, useState } from "react";
import ClearButton from "../components/ClearButton";
import Footer from "../components/Footer";
import Grid from "../components/Grid";
import Header from "../components/Header";
import SolveButton from "../components/SolveButton";
import LoadButton from "../components/LoadButton";
import { useQueryClient, useQuery } from "@tanstack/react-query";

export type CellState = {
	value: number;
	isGiven: boolean;
	clear: boolean;
};

const backendHosts = ["http://localhost:5000", "https://lesedi.alwaysdata.net"];

export default function Home() {
	const [grid, setGrid] = useState<CellState[]>(
		// Array(81).fill({ value: 0, isGiven: false, clear: false }),

		// apparently the object method creates 81 copies of the same object reference
		// (meaning updating one cell updates them all)
		// so now, we'll give them individuality
		Array.from({ length: 81 }, () => ({
			value: 0,
			isGiven: false,
			clear: false,
		})),
	);
	const [solveTime, setSolveTime] = useState<string | undefined>(undefined);
	const clueCount = useMemo(
		() => grid.filter((cell) => cell.value !== 0).length,
		[grid],
	);

	const query = useQuery({
		queryKey: ["activeBackends"],
		queryFn: async () => {
			const results = await Promise.allSettled(
				backendHosts.map((host) =>
					fetch(`${host}/health`).then((res) => {
						if (!res.ok)
							throw new Error(`Health check failed for ${host}`);
						return host;
					}),
				),
			);

			const activeBackends = results
				.filter(
					(r): r is PromiseFulfilledResult<string> =>
						r.status === "fulfilled",
				)
				.map((r) => r.value);

			if (activeBackends.length === 0) {
				throw new Error("No active backends found");
			}
			return activeBackends;
		},
		retry: 1,
	});

	// console.log(query)

	const getBackendURL = () => {
		// not sure if/how this if-statement will be reached but just in case yk
		if (query.isLoading || !query.data || query.data.length === 0) {
			return null;
		}
		// console.log("Active backends:", query.data);
		return query.data[0]; // Return the first active backend
	};

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
		const backendURL = getBackendURL();
		if (!backendURL) {
			alert("No backend available");
			return;
		}

		if (clueCount === 0) {
			alert("You gotta give us a couple clues first :)");
			return;
		}

		if (clueCount < 17) {
			alert(
				"At least 17 clues are required for a valid Sudoku puzzle. Please add more numbers.",
			);
			return;
		}

		if (clueCount === 81) {
			alert("The puzzle is already complete! Clear some cells to solve.");
			return;
		}

		const payload: number[][] = [];
		for (let i = 0; i < 9; i++) {
			const row: number[] = [];
			for (let j = 0; j < 9; j++) {
				row.push(grid[i * 9 + j].value);
			}
			payload.push(row);
		}

		fetch(`${backendURL}/solve`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ grid: payload }),
		})
			.then(async (response) => {
				if (response.status === 422) {
					alert(await response.text());
					throw new Error("Invalid puzzle input");
				}
				return response.json();
			})
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
		const backendURL = getBackendURL();
		if (!backendURL) {
			alert("No backend available");
			return;
		}

		fetch(`${backendURL}/random?difficulty=easy`)
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

	if (query.isError) {
		return (
			<div className="px-4 my-5 text-center">
				<h1 className="display-5 fw-bold">Error</h1>
				<div className="col-lg-6 mx-auto">
					<p className="lead mb-4">
						Failed to connect to any backend server. Please try
						again later.
					</p>
				</div>
			</div>
		);
	}

	// const buttonsEnabled = !query.isLoading && query.data !== undefined && query.data.length > 0;
	// console.log("Buttons enabled:", buttonsEnabled);
	const buttonsDisabled =
		query.isLoading || !query.data || query.data.length === 0;
	console.log("Buttons disabled:", buttonsDisabled);
	const solveDisabled = buttonsDisabled || clueCount === 81;
	const loadAndClearDisabled = buttonsDisabled || query.isLoading;

	return (
		<>
			<Header />

			<div className="px-4 my-1 text-center">
				<div className="col-lg-6 mx-auto">
					<p className="lead mb-2">
						{/* Enter the numbers in the puzzle & click on 'Solve' to
						the see the solution. */}
						Fill in some puzzle clues and click "Solve" to see the
						solution!
					</p>
					<Grid cellChangeFn={numValChanged} grid={grid} />
					{solveTime && (
						<p className="mt-2">
							Solved in <strong>{solveTime}</strong>!
						</p>
					)}

					<div className="mt-2 d-grid gap-2 d-sm-flex justify-content-sm-center">
						<SolveButton
							onClickFn={btnSolveClick}
							disabled={solveDisabled}
						/>
						<ClearButton
							onClickFn={btnClearClick}
							disabled={loadAndClearDisabled}
						/>
						<LoadButton
							onClickFn={btnLoadClick}
							disabled={loadAndClearDisabled}
						/>
					</div>
				</div>
			</div>

			<Footer />
		</>
	);
}
