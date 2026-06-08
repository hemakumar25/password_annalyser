import { useState } from 'react';

const generatePassword = (length = 16) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
  let password = '';
  for (let i = 0; i < length; i += 1) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  return password;
};

export default function PasswordGenerator({ onPasswordGenerated }) {
  const [generated, setGenerated] = useState('');

  const handleGenerate = () => {
    const password = generatePassword(18);
    setGenerated(password);
    onPasswordGenerated(password);
  };

  const handleCopy = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Password Generator</h3>
        <span className="badge">Built-in</span>
      </div>
      <p>Generate a secure password with uppercase, lowercase, digits and symbols.</p>
      <div className="generator-card">
        <div className="generated-password">{generated || 'Click generate to create a secure password.'}</div>
        <div className="button-row">
          <button className="secondary-button" onClick={handleGenerate}>Generate</button>
          <button className="primary-button" onClick={handleCopy} disabled={!generated}>Copy</button>
        </div>
      </div>
    </div>
  );
}
