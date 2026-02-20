import Footer from "../components/Footer";
import Header from "../components/Header";

export default function About() {
	return (
		<>
			<Header />

			<div className="container">
				<main className="px-3 px-4 my-1">
					<h1 className="py-3">About this project</h1>

					<p className="lead px-2 py-3">
						Welcome to Lesedi's Sudoku Solver! This project was
						created to make solving Sudoku puzzles fast! Whether
						you're stuck on a puzzle or just curious about how it
						works, this tool can help you find solutions instantly.
					</p>

					<p className="lead px-2 py-3">
						This project started during the December 2022 holidays
						when I was playing Sudoku on my phone. I realized that
						solving Sudoku puzzles could be done mathematically
						without needing AI, so I set out to create my own
						solver. Over time, I refined the algorithms to make them
						faster and more efficient.
					</p>

					<p>
						See my{" "}
						<a href="https://github.com/lkekana/sudoku-solver">
							GitHub repo
						</a>{" "}
						for the source code and more details about the
						algorithms used in this project.
					</p>
				</main>
			</div>

			<Footer />
		</>
	);
}
