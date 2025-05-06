// src/api.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // フロントで直接使う場合は必須（セキュリティ注意）
});

export default openai;
