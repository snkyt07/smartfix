import { useState } from 'react';
import OpenAI from 'openai';

const spinnerStyle: React.CSSProperties = {
  marginLeft: '0.5rem',
  width: '16px',
  height: '16px',
  border: '2px solid white',
  borderTop: '2px solid transparent',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

// キーフレーム（Vite/ReactではグローバルCSSでもOK）
const styleTag = document.createElement('style');
styleTag.innerHTML = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
document.head.appendChild(styleTag);

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const DAILY_LIMIT_REQUESTS = 5;
const DAILY_LIMIT_TOKENS = 1000;

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestsToday, setRequestsToday] = useState(0);
  const [tokensToday, setTokensToday] = useState(0);

  const handleSend = async () => {
    const inputTokens = prompt.length;

    if (requestsToday >= DAILY_LIMIT_REQUESTS) {
      alert('本日のリクエスト上限に達しました');
      return;
    }

    if (tokensToday + inputTokens > DAILY_LIMIT_TOKENS) {
      alert('本日のトークン使用量の上限に達しました');
      return;
    }

    setLoading(true);
    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });

      const usedTokens = res.usage?.total_tokens || (inputTokens + 300);
      setResponse(res.choices[0].message?.content || 'No response');

      const newRequests = requestsToday + 1;
      const newTokens = tokensToday + usedTokens;
      setRequestsToday(newRequests);
      setTokensToday(newTokens);

      if (newRequests >= DAILY_LIMIT_REQUESTS) {
        alert('本日のリクエスト上限に達しました');
      }
      if (newTokens >= DAILY_LIMIT_TOKENS) {
        alert(`本日のトークン使用量が上限に達しました（${newTokens} トークン）`);
      }
    } catch (err) {
      console.error(err);
      setResponse('エラーが発生しました');
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#121212',
        color: 'white',
      }}
    >
      <div style={{ textAlign: 'center', width: '90%', maxWidth: '600px' }}>
        <h1>ChatGPT API</h1>
        <textarea
          rows={4}
          cols={50}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="さあ、はじめましょう。"
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        />
        <br />
        <button
  onClick={handleSend}
  disabled={
    loading ||
    requestsToday >= DAILY_LIMIT_REQUESTS ||
    tokensToday >= DAILY_LIMIT_TOKENS
  }
  style={{
    padding: '0.5rem 1.5rem',
    fontSize: '1rem',
    borderRadius: '4px',
    backgroundColor: '#444',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  }}
>
  {loading ? '送信中...' : '送信'}
  {loading && <span style={spinnerStyle} />}
</button>

        <pre
          style={{
            marginTop: '1.5rem',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            background: '#1e1e1e',
            padding: '1rem',
            borderRadius: '6px',
            height: '200px',
            overflow: 'auto',
            fontSize: '0.95rem',
          }}
        >
          {response}
        </pre>
        <p>本日のリクエスト数：{requestsToday} / {DAILY_LIMIT_REQUESTS}</p>
        <p>本日のトークン使用量（仮）：{tokensToday} / {DAILY_LIMIT_TOKENS}</p>
      </div>
    </div>
  );
}

export default App;
