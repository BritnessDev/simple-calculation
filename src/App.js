import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Empty from './component/Empty';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Empty />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
