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
				</ul>
			</header>
		</div>
	);
}
