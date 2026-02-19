type SolveButtonProps = { onClickFn: () => void };
export default function SolveButton({ onClickFn }: SolveButtonProps) {
	return (
		<button
			type="button"
			className="btn btn-primary btn-lg px-4 gap-3"
			id="btn-solve"
			onClick={onClickFn}
		>
			Solve
		</button>
	);
}
