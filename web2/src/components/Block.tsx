import { CellState } from "../pages/Home";
import Cell from "./Cell";

type BlockProps = {
	index: number;
	onChangeFn: (e: React.ChangeEvent<HTMLInputElement>) => void;
	grid: CellState[];
};

// props.index is 0-based index of the block, starting from the top-left block and going left to right, top to bottom
export default function Block({ index, onChangeFn, grid }: BlockProps) {
	const startingRow = Math.floor(index / 3) * 3;
	const startingCol: number = (index % 3) * 3;
	return (
		<div
			className="px-0 col big-block border border-1"
			style={{ "--bs-border-opacity": 0.5 } as React.CSSProperties}
		>
			{[0, 1, 2].map((ri) => (
				<div className="input-group input-row" key={`r-${index}-${ri}`}>
					{[0, 1, 2].map((ci) => (
						<Cell
							key={`c-${index}-${ri}-${ci}`}
							row={startingRow + ri}
							col={startingCol + ci}
							onChangeFn={onChangeFn}
							grid={grid}
						/>
					))}
				</div>
			))}
		</div>
	);
}
