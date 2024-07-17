import Dashboard from "./Dashboard"
import './app.css'
import { Route, Routes } from "react-router-dom"

function App() {

  return (
    <>
    <Routes>
      <Route exact path='/'>Dashboard</Route>
    </Routes>
    </>
  )
}

export default App
