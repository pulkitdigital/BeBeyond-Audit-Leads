import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import AuditForm from './components/AuditForm'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header />
      <AuditForm />
      <Footer />
      
    </>
  )
}

export default App
