import { createContext } from 'react';

const AuthContext = createContext({  
  auth: {
    isAuthenticated: false,
    token: null,
    user: null,
    loading: true
  },
  login: () => {},
  logout: () => {}
});
export default AuthContext;
