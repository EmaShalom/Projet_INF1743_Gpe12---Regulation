import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <h1>🎓 UQO-Requests</h1>
        <p>Projet INF1743 - Livrable L1</p>
        <p>✅ Structure de base créée par le chef de groupe</p>
        <p>⏳ Les membres vont ajouter leurs pages ici...</p>
        
        <Routes>
          <Route path="/" element={
            <div>
              <h2>Page d'accueil temporaire</h2>
              <p>Les routes seront ajoutées par les membres</p>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App