import { Dashboard } from './components/Dashboard';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <>
      <Dashboard />
      <Toaster position="top-right" />
    </>
  );
}