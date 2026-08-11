import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
import axios from 'axios'
import App from './App.tsx'
import { store } from './app/store.ts'
import './index.css'
import { setupInterceptors } from './services/axiosSetup.ts'

setupInterceptors(axios);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </StrictMode>,
)