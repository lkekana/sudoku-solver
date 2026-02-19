import Footer from "../components/Footer";
import Header from "../components/Header";

export default function About() {
	return (
		<>
			<Header />

			<div className="container">
				<main className="px-3 px-4 my-1 text-center">
					<h1 className="py-3">About this project</h1>
					<p className="lead px-2 py-3">
						Hi, I&apos;m Lesedi.
						<br />I was bored during the December 2022 holidays and
						started playing the Sudoku.com iPhone app when I
						realised that Sudoku is very likely easy to solve using
						mathematics and wouldn&apos;t need AI so I set out on
						solving the puzzles using my own algorithm (presented on
						this site)
						<br />
						Try it out and enjoy :)
					</p>
				</main>
			</div>

			<Footer />
		</>
	);
}
