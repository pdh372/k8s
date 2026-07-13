import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LessonsPage from './pages/LessonsPage';
import LessonPage from './pages/LessonPage';
import DiagramsPage from './pages/DiagramsPage';
import LabsPage from './pages/LabsPage';
import LabPage from './pages/LabPage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizPage from './pages/QuizPage';
import GcpHomePage from './pages/GcpHomePage';
import LandingPage from './pages/LandingPage';

export default function App() {
	return (
		<Routes>
			<Route element={<Layout />}>
				<Route
					path='/'
					element={<LandingPage />}
				/>
				<Route
					path='/k8s'
					element={<HomePage />}
				/>
				<Route
					path='/k8s/lessons'
					element={<LessonsPage />}
				/>
				<Route
					path='/k8s/lessons/:id'
					element={<LessonPage />}
				/>
				<Route
					path='/k8s/diagrams'
					element={<DiagramsPage />}
				/>
				<Route
					path='/k8s/labs'
					element={<LabsPage />}
				/>
				<Route
					path='/k8s/labs/:id'
					element={<LabPage />}
				/>
				<Route
					path='/k8s/architecture'
					element={
						<Navigate
							to='/k8s/diagrams'
							replace
						/>
					}
				/>
				<Route
					path='/k8s/flashcards'
					element={<FlashcardsPage />}
				/>
				<Route
					path='/k8s/quiz'
					element={<QuizPage />}
				/>
				<Route
					path='/gcp'
					element={<GcpHomePage />}
				/>
				<Route
					path='/gcp/lessons'
					element={<LessonsPage />}
				/>
				<Route
					path='/gcp/lessons/:id'
					element={<LessonPage />}
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
