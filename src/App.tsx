// src/App.tsx
import { trpc } from './trpc'; // Updated import
import './App.css';

function App() {
  const { data, isLoading, isError } = trpc.hello.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <div className="App">
      <h1>Vite + tRPC + Netlify Functions</h1>
      <p>{data?.message || 'No message'}</p>
    </div>
  );
}

export default App;