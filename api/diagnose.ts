// api/diagnose.ts
import OpenAI from 'openai'
import { VercelRequest, VercelResponse } from '@vercel/node'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { sessionId, payload } = req.body

  const gpt = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'You are an appliance diagnostic assistant...' },
      { role: 'user', content: JSON.stringify(payload) }
    ],
    max_tokens: 300,
    temperature: 0.4
  })

  res.status(200).json(JSON.parse(gpt.choices[0].message.content!))
}
