type ClearButtonProps = {
	onClickFn: () => void;
	disabled: boolean;
};

export default function ClearButton({ onClickFn, disabled }: ClearButtonProps) {
	return (
		<button
			type="button"
			className="btn btn-outline-secondary btn-lg px-4"
			id="btn-clear"
			onClick={onClickFn}
			disabled={disabled}
		>
			Clear
		</button>
	);
}
