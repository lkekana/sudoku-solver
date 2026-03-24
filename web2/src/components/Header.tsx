import { Link, NavLink } from "react-router-dom";

export default function Header() {
	return (
		<div className="container">
			<header className="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
				<Link
					to="/"
					className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none"
				>
					<span className="fs-4">lesedi's Sudoku Solver</span>
				</Link>

				<ul className="nav nav-pills">
					<li className="nav-item">
						<NavLink
							to="/"
							className={({ isActive }) =>
								"nav-link" + (isActive ? " active" : "")
							}
						>
							Home
						</NavLink>
					</li>
					<li className="nav-item">
						<NavLink
							to="/about"
							className={({ isActive }) =>
								"nav-link" + (isActive ? " active" : "")
							}
						>
							About
						</NavLink>
					</li>
					<li className="nav-item mx-2">
						<a
							href="https://github.com/lkekana/sudoku-solver"
							target="_blank"
							rel="noopener noreferrer"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="32px"
								height="100%"
								fill="currentColor"
								class="bi bi-github"
								viewBox="0 0 16 16"
							>
								<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
							</svg>
						</a>
					</li>
				</ul>
			</header>
		</div>
	);
}
