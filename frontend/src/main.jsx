import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './index.css'
import { ThemeProvider } from "./context/ThemeContext";
import { ProfileProvider } from './context/ProfileContext';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)