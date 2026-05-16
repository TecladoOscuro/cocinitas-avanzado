import { HashRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Detail } from './pages/Detail'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/receta/:id" element={<Detail />} />
      </Routes>
    </HashRouter>
  )
}
