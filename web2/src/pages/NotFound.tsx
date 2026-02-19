import Footer from "../components/Footer";
import Header from "../components/Header";

export default function NotFound() {
	return (
		<>
			<Header />

			<div className="container">
				<main className="px-3 px-4 my-1 text-center">
					<h1 className="py-3">Page Not Found</h1>
					<p className="lead px-2 py-3">
						Oops! The page you are looking for does not exist.
						<br />
						It might have been moved or deleted.
						<br />
						Please check the URL or go back to the homepage.
					</p>
					<a href="/" className="btn btn-primary mt-3">
						Go to Homepage
					</a>
				</main>
			</div>

			<Footer />
		</>
	);
}
