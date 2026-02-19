type ClearButtonProps = { onClickFn: () => void };

export default function ClearButton({ onClickFn }: ClearButtonProps) {
	return (
		<button
			type="button"
			className="btn btn-outline-secondary btn-lg px-4"
			id="btn-clear"
			onClick={onClickFn}
		>
			Clear
		</button>
	);
}
