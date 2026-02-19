import { CellState } from "../pages/Home";

type CellProps = {
	row: number;
	col: number;
	onChangeFn: (e: React.ChangeEvent<HTMLInputElement>) => void;
	grid: CellState[];
};

export default function Cell({ row, col, onChangeFn, grid }: CellProps) {
	const cell = grid[row * 9 + col];
	const id = `${row},${col}`;
	// value is empty string if grid[row*9 + col].value is not 1-9, else it is grid[row*9 + col].value
	const val = cell.value;
	const styles = {
		borderRadius: "0",
		padding: "0.5em",
		fontStyle: "italic",
		fontFamily: "Arial, Helvetica, sans-serif",
		fontSize: "16pt",
		fontWeight: cell.isGiven ? "bold" : "",
	};

	return (
		<input
			type="number"
			min="1"
			max="9"
			className="form-control text-center num-input"
			onChange={onChangeFn}
			id={id}
			style={styles}
			value={val >= 1 && val <= 9 ? val : ""}
		/>
	);
}
