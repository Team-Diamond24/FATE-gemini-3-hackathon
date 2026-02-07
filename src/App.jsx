import { useState } from 'react'
import { testGemini } from './services/api'
import './App.css'

function App() {
  const [response, setResponse] = useState('')

  const handleTestClick = async () => {
    setResponse('Loading...')
    try {
      const result = await testGemini()
      setResponse(result)
    } catch (error) {
      setResponse('Error: ' + error.message)
    }
  }

  return (
    <div className="app-container">
      <h1>Gemini Hackathon Starter</h1>
      <button onClick={handleTestClick}>Test Gemini</button>
      <br />
      <textarea
        readOnly
        value={response}
        placeholder="API response will appear here..."
        rows={10}
        cols={50}
        style={{ marginTop: '20px' }}
      />
    </div>
  )
}

export default App
