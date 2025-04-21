import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import AddSubscription from './pages/AddSubscription';
import Header from './components/Header';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import axios from 'axios';

function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    token: localStorage.getItem('token'),
    user: null,
    loading: true
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/api/users/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAuth({
            isAuthenticated: true,
            token,
            user: response.data,
            loading: false
          });
        } catch (error) {
          localStorage.removeItem('token');
          console.error('Authentication error:', error);
          setAuth({
            isAuthenticated: false,
            token: null,
            user: null,
            loading: false
          });
        }
      } else {
        setAuth(prev => ({ ...prev, loading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    setAuth({
      isAuthenticated: true,
      token,
      user,
      loading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({
      isAuthenticated: false,
      token: null,
      user: null,
      loading: false
    });
  };

  if (auth.loading) {
    return <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-200">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      <Router>
        <div className="flex h-screen bg-slate-900">
          <div className="flex-1 overflow-auto">
            {auth.isAuthenticated && <Header />}
            <main className="container mx-auto px-4 py-6">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/add" element={<AddSubscription />} />
                </Route>
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;