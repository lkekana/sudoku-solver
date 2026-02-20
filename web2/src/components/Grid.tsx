import Block from "./Block";
import type { CellState } from "../pages/Home";

type GridProps = {
	cellChangeFn: (e: React.ChangeEvent<HTMLInputElement>) => void;
	grid: CellState[];
};
export default function Grid({ cellChangeFn, grid }: GridProps) {
	return (
		<div id="grid" className="pt-0 pb-2">
			<div className="row my-row">
				{[0, 1, 2].map((i) => (
					<Block
						key={`b-top-${i}`}
						index={i}
						onChangeFn={cellChangeFn}
						grid={grid}
					/>
				))}
			</div>
			<div className="row my-row">
				{[3, 4, 5].map((i) => (
					<Block
						key={`b-mid-${i}`}
						index={i}
						onChangeFn={cellChangeFn}
						grid={grid}
					/>
				))}
			</div>
			<div className="row my-row">
				{[6, 7, 8].map((i) => (
					<Block
						key={`b-bot-${i}`}
						index={i}
						onChangeFn={cellChangeFn}
						grid={grid}
					/>
				))}
			</div>
		</div>
	);
}
