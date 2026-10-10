import { useGame } from './game/GameContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ToastArea from './components/ToastArea';
import Register from './stages/Register';
import Dashboard from './stages/Dashboard';
import CompanyEntry from './stages/CompanyEntry';
import Seminar from './stages/Seminar';
import EntrySheet from './stages/EntrySheet';
import WebTest from './stages/WebTest';
import Booking from './stages/Booking';
import Interview from './stages/Interview';
import Waiting from './stages/Waiting';
import Oinori from './stages/Oinori';
import Result from './stages/Result';

const SCREENS = {
  register: Register,
  dashboard: Dashboard,
  entry: CompanyEntry,
  seminar: Seminar,
  es: EntrySheet,
  webtest: WebTest,
  booking: Booking,
  interview: Interview,
  waiting: Waiting,
  oinori: Oinori,
  result: Result,
};

export default function App() {
  const { state } = useGame();
  const Screen = SCREENS[state.screen];
  return (
    <div className="app">
      <Header />
      <main className="main">
        {/* key で画面ごとに状態をリセット（ページ遷移したら入力は消える） */}
        <Screen key={`${state.screen}-${state.startedAt}`} />
      </main>
      <Footer />
      <ToastArea />
    </div>
  );
}
