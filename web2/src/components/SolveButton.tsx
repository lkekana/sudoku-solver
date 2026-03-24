type SolveButtonProps = {
	onClickFn: () => void;
	disabled: boolean;
};

export default function SolveButton({ onClickFn, disabled }: SolveButtonProps) {
	return (
		<button
			type="button"
			className="btn btn-primary btn-lg px-4 gap-3"
			id="btn-solve"
			onClick={onClickFn}
			disabled={disabled}
		>
			Solve
		</button>
	);
}
