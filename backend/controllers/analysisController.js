import Analysis from '../models/Analysis.js';

const commonPasswords = [
  '123456', 'password', '12345678', 'qwerty', 'abc123',
  '111111', '123123', 'admin', 'letmein', 'welcome',
];

const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', '123456', 'password', 'admin'];

const evaluatePassword = (password) => {
  const suggestions = [];
  const lower = password.toLowerCase();
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const length = password.length;

  let score = 0;
  if (length >= 8) score += 20;
  if (length >= 12) score += 10;
  if (hasLower) score += 15;
  if (hasUpper) score += 15;
  if (hasNumber) score += 15;
  if (hasSpecial) score += 15;

  const repeatCount = password.split('').reduce((acc, char) => {
    acc[char] = (acc[char] || 0) + 1;
    return acc;
  }, {});

  const repeatedChars = Object.values(repeatCount).filter((count) => count > 1).length;
  if (repeatedChars <= 1) score += 10;

  const isCommon = commonPasswords.includes(lower);
  const hasPattern = keyboardPatterns.some((pattern) => lower.includes(pattern));
  if (isCommon || hasPattern) score = Math.max(score - 30, 0);

  if (length < 8) suggestions.push('Use at least 8 characters.');
  if (!hasUpper) suggestions.push('Add uppercase letters.');
  if (!hasLower) suggestions.push('Add lowercase letters.');
  if (!hasNumber) suggestions.push('Include numbers.');
  if (!hasSpecial) suggestions.push('Add special characters.');
  if (repeatedChars > 1) suggestions.push('Avoid repeating the same character too often.');
  if (isCommon) suggestions.push('Avoid common passwords.');
  if (hasPattern) suggestions.push('Avoid simple keyboard patterns.');

  const charsetSize =
    (hasLower ? 26 : 0) +
    (hasUpper ? 26 : 0) +
    (hasNumber ? 10 : 0) +
    (hasSpecial ? 33 : 0);
  const entropy = Math.round(length * Math.log2(charsetSize || 1));

  let crackTime = 'Instantly';
  if (entropy >= 80) crackTime = 'Decades';
  else if (entropy >= 60) crackTime = 'Years';
  else if (entropy >= 45) crackTime = 'Months';
  else if (entropy >= 30) crackTime = 'Days';
  else if (entropy >= 15) crackTime = 'Hours';

  const clampedScore = Math.min(100, Math.max(0, score));
  let strength = 'Very Weak';
  if (clampedScore >= 85) strength = 'Very Strong';
  else if (clampedScore >= 70) strength = 'Strong';
  else if (clampedScore >= 50) strength = 'Medium';
  else if (clampedScore >= 30) strength = 'Weak';

  return {
    score: clampedScore,
    entropy,
    crackTime,
    strength,
    suggestions,
  };
};

export const analyzePassword = async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'Password is required for analysis.' });
  }

  const result = evaluatePassword(password);

  const record = await Analysis.create({
    userId: req.user._id,
    password,
    score: result.score,
    entropy: result.entropy,
    crackTime: result.crackTime,
    strength: result.strength,
    suggestions: result.suggestions,
  });

  res.status(201).json({ ...result, analysisId: record._id, createdAt: record.createdAt });
};

export const getHistory = async (req, res) => {
  const history = await Analysis.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(history);
};
