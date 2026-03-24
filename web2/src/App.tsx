import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/about" element={<About />} />X
				<Route path="*" element={<NotFound />} />
			</Routes>
		</QueryClientProvider>
	);
}
