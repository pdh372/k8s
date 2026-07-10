import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LessonsPage from './pages/LessonsPage';
import LessonPage from './pages/LessonPage';
import DiagramsPage from './pages/DiagramsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizPage from './pages/QuizPage';

export default function App() {
	return (
		<Routes>
			<Route element={<Layout />}>
				<Route
					path='/'
					element={<HomePage />}
				/>
				<Route
					path='/lessons'
					element={<LessonsPage />}
				/>
				<Route
					path='/lessons/:id'
					element={<LessonPage />}
				/>
				<Route
					path='/diagrams'
					element={<DiagramsPage />}
				/>
				<Route
					path='/architecture'
					element={
						<Navigate
							to='/diagrams'
							replace
						/>
					}
				/>
				<Route
					path='/flashcards'
					element={<FlashcardsPage />}
				/>
				<Route
					path='/quiz'
					element={<QuizPage />}
				/>
				<Route
					path='*'
					element={
						<Navigate
							to='/'
							replace
						/>
					}
				/>
			</Route>
		</Routes>
	);
}
