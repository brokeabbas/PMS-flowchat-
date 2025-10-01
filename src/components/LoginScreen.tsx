import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous error

    try {
      if (mode === 'login') {
        await login(email, pass);
      } else {
        await signup(email, pass, username);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.msg ||
        err?.message ||
        'Something went wrong. Please try again.';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-gray-900 rounded-xl p-6 shadow-md space-y-4"
      >
        <h2 className="text-xl font-semibold text-center">
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </h2>

        {/* 🔴 Error Message */}
        {error && (
          <div className="bg-red-700 text-white p-2 rounded text-sm text-center">
            {error}
          </div>
        )}

        {mode === 'signup' && (
          <input
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <input
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          placeholder="Password"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-white"
        >
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </button>

        <p className="text-center text-sm text-gray-400">
          {mode === 'login' ? 'Need an account?' : 'Already have one?'}{' '}
          <button
            type="button"
            className="text-blue-400 hover:underline"
            onClick={() =>
              setMode((prev) => (prev === 'login' ? 'signup' : 'login'))
            }
          >
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </form>
    </div>
  );
}
