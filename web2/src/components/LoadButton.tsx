type LoadButtonProps = {
	onClickFn: () => void;
	disabled: boolean;
};

export default function LoadButton({ onClickFn, disabled }: LoadButtonProps) {
	return (
		<button
			type="button"
			className="btn btn-outline-secondary btn-lg px-4"
			id="btn-load"
			onClick={onClickFn}
			disabled={disabled}
		>
			Random ⚄
		</button>
	);
}
