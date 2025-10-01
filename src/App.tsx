import FlowCanvas from './components/FlowCanvas';
import MainLayout from './components/layout/MainLayout';

export default function App() {
  // Always show the app; no auth gate
  return (
    <MainLayout>
      <FlowCanvas />
    </MainLayout>
  );
}
