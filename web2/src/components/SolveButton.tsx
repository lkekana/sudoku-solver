type SolveButtonProps = {
	onClickFn: () => void;
	disabled: boolean;
	differentSolveMethodSelected?: boolean;
};

export default function SolveButton({
	onClickFn,
	disabled,
	differentSolveMethodSelected,
}: SolveButtonProps) {
	return (
		<button
			type="button"
			className="btn btn-primary btn-lg px-4 gap-3"
			id="btn-solve"
			onClick={onClickFn}
			disabled={disabled}
		>
			{differentSolveMethodSelected ? "Re-Solve" : "Solve"}
		</button>
	);
}
