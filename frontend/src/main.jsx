// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import { ThemeProvider } from "./context/ThemeContext";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
        <ToastContainer position="top-right" theme="colored" autoClose={3000} />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)