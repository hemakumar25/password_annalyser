import { useEffect, useState } from 'react';
import { authRequest, analyzePassword, fetchHistory } from './api.js';
import PasswordGenerator from './components/PasswordGenerator.jsx';

const defaultUser = { email: '', token: '' };

const strengthColors = {
  'Very Weak': '#ff4d4f',
  Weak: '#ff7a45',
  Medium: '#ffd666',
  Strong: '#73d13d',
  'Very Strong': '#36cfc9',
};

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('psa_user');
    return stored ? JSON.parse(stored) : defaultUser;
  });
  const [history, setHistory] = useState([]);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    document.body.dataset.theme = darkMode ? 'dark' : 'light';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (user.token) {
      loadHistory(user.token);
    }
  }, [user.token]);

  const handleAuth = async () => {
    setAuthMessage('');
    const endpoint = authMode === 'login' ? 'auth/login' : 'auth/register';
    const result = await authRequest(endpoint, { email: authEmail, password: authPassword });
    if (result.token) {
      const loggedUser = { email: result.email, token: result.token };
      setUser(loggedUser);
      localStorage.setItem('psa_user', JSON.stringify(loggedUser));
      setAuthMessage('Authenticated successfully.');
      loadHistory(result.token);
    } else {
      setAuthMessage(result.message || 'Authentication failed.');
    }
  };

  const loadHistory = async (token) => {
    setLoadingHistory(true);
    const result = await fetchHistory(token);
    if (Array.isArray(result)) {
      setHistory(result);
    }
    setLoadingHistory(false);
  };

  const handleAnalyze = async () => {
    if (!password) return;
    const result = user.token ? await analyzePassword(password, user.token) : { message: 'Log in to save your analysis.', ...analyzePasswordLocal(password) };
    if (result?.score !== undefined) {
      setAnalysis(result);
    } else {
      setAnalysis({ strength: 'Very Weak', score: 0, entropy: 0, crackTime: 'Unknown', suggestions: [result.message || 'Unable to analyze'] });
    }
  };

  const analyzePasswordLocal = (passwordToAnalyze) => {
    const length = passwordToAnalyze.length;
    const hasUpper = /[A-Z]/.test(passwordToAnalyze);
    const hasLower = /[a-z]/.test(passwordToAnalyze);
    const hasNumber = /[0-9]/.test(passwordToAnalyze);
    const hasSpecial = /[^A-Za-z0-9]/.test(passwordToAnalyze);
    let score = 0;
    if (length >= 8) score += 20;
    if (length >= 12) score += 10;
    if (hasLower) score += 15;
    if (hasUpper) score += 15;
    if (hasNumber) score += 15;
    if (hasSpecial) score += 15;
    const repeated = passwordToAnalyze.split('').reduce((acc, char) => {
      acc[char] = (acc[char] || 0) + 1;
      return acc;
    }, {});
    const repeatedScore = Object.values(repeated).filter((count) => count > 1).length;
    if (repeatedScore <= 1) score += 10;
    return { score, entropy: Math.max(0, Math.round(Math.log2(Math.max(1, score * length)))), crackTime: 'Local estimate', strength: score > 80 ? 'Very Strong' : score > 60 ? 'Strong' : score > 40 ? 'Medium' : score > 20 ? 'Weak' : 'Very Weak', suggestions: [] };
  };

  const handleLogout = () => {
    setUser(defaultUser);
    localStorage.removeItem('psa_user');
    setHistory([]);
    setAnalysis(null);
  };

  const handleDownloadReport = async () => {
    if (!analysis) return;
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt' });
    doc.setFontSize(18);
    doc.text('Password Strength Analysis Report', 40, 50);
    doc.setFontSize(12);
    doc.text(`Email: ${user.email || 'Guest'}`, 40, 90);
    doc.text(`Password inspected: ${password}`, 40, 110);
    doc.text(`Strength: ${analysis.strength}`, 40, 130);
    doc.text(`Score: ${analysis.score}`, 40, 150);
    doc.text(`Entropy: ${analysis.entropy}`, 40, 170);
    doc.text(`Estimated crack time: ${analysis.crackTime}`, 40, 190);
    doc.text('Suggestions:', 40, 220);
    analysis.suggestions.forEach((line, idx) => {
      doc.text(`- ${line}`, 60, 240 + idx * 16);
    });
    doc.save('password-analysis-report.pdf');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Password Strength Analyzer</h1>
          <p>Secure your credentials with real-time feedback, history, and custom reports.</p>
        </div>
        <button className="ghost-button" onClick={() => setDarkMode((prev) => !prev)}>
          {darkMode ? 'Light mode' : 'Dark mode'}
        </button>
      </header>

      <main className="grid-layout">
        <section className="panel">
          <div className="panel-header">
            <h2>Analyze a password</h2>
            <span className="badge">Cyber defense</span>
          </div>

          <div className="form-row">
            <label>Password</label>
            <div className="input-with-action">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password to analyze"
              />
              <button className="action-button" onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="button-row">
            <button className="primary-button" onClick={handleAnalyze}>Analyze</button>
            <button className="secondary-button" onClick={handleDownloadReport} disabled={!analysis}>
              Export PDF
            </button>
          </div>

          {analysis ? (
            <div className="analysis-card">
              <div className="strength-header">
                <h3>{analysis.strength}</h3>
                <span className="score">{analysis.score}/100</span>
              </div>
              <div className="meter" aria-label="Password strength meter">
                <div className="meter-bar" style={{ width: `${analysis.score}%`, background: strengthColors[analysis.strength] || '#7cb305' }} />
              </div>
              <div className="analysis-stats">
                <div>
                  <strong>Entropy</strong>
                  <span>{analysis.entropy}</span>
                </div>
                <div>
                  <strong>Crack time</strong>
                  <span>{analysis.crackTime}</span>
                </div>
              </div>
              <div className="suggestions">
                <h4>Suggestions</h4>
                <ul>
                  {analysis.suggestions.length > 0 ? (
                    analysis.suggestions.map((item, index) => <li key={index}>{item}</li>)
                  ) : (
                    <li>Good password. Consider adding more length or symbols.</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="placeholder-card">
              <p>Enter a password and press Analyze to see strength metrics, entropy, and improvement tips.</p>
            </div>
          )}
        </section>

        <section className="panel sidebar">
          <PasswordGenerator onPasswordGenerated={setPassword} />

          <div className="panel small-panel">
            <h3>{user.token ? 'Dashboard' : 'Welcome'}</h3>
            {user.token ? (
              <>
                <p>Signed in as {user.email}</p>
                <button className="danger-button" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <div className="auth-switch">
                  <button className={authMode === 'login' ? 'toggle-active' : ''} onClick={() => setAuthMode('login')}>Login</button>
                  <button className={authMode === 'register' ? 'toggle-active' : ''} onClick={() => setAuthMode('register')}>Register</button>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="name@example.com" />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Secure password" />
                </div>
                <button className="primary-button" onClick={handleAuth}>{authMode === 'login' ? 'Login' : 'Create account'}</button>
                {authMessage && <p className="auth-message">{authMessage}</p>}
              </>
            )}
          </div>

          <div className="panel small-panel">
            <h3>History</h3>
            {loadingHistory ? (
              <p>Loading history...</p>
            ) : history.length ? (
              <ul className="history-list">
                {history.slice(0, 5).map((item) => (
                  <li key={item._id}>
                    <span>{item.strength}</span>
                    <strong>{item.score}/100</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No saved history yet. Login and analyze to store entries.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
