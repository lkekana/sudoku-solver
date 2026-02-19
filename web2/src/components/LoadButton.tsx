type LoadButtonProps = { onClickFn: () => void };

export default function LoadButton({ onClickFn }: LoadButtonProps) {
	return (
		<button
			type="button"
			className="btn btn-outline-secondary btn-lg px-4"
			id="btn-load"
			onClick={onClickFn}
		>
			Random ⚄
		</button>
	);
}
