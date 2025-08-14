// src/App.tsx
import { trpc } from './trpc';
import './App.css';

interface User {
  id: number;
  name: string;
  email: string;
}

interface GreetResponse {
  message: string;
  users: User[];
}

function App() {
  const { data, isLoading, isError, error } = trpc.greet.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) {
    console.error('tRPC error:', error);
    return <div>Error: {error.message}</div>;
  }

  const response = data as GreetResponse;

  return (
    <div className="App">
      <h1>Vite + tRPC + Prisma + Netlify Functions</h1>
      <p>{response.message}</p>
      <h2>Users:</h2>
      <ul>
        {response.users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;