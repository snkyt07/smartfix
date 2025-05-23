// api/diagnose.ts
import OpenAI from 'openai'
import { VercelRequest, VercelResponse } from '@vercel/node'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const safeJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return { error: 'bad-json', raw: text };
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    type ReqBody = {
      sessionId?: string | null;
      payload: {
        device: string;
        symptom: string;
        history: { question: string; answer: 'yes' | 'no' }[];
      };
      historyMsgs?: { role: 'assistant' | 'user'; content: string }[];
    };
    const { payload, historyMsgs = [] } = req.body as ReqBody;

    const gpt = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 
          `You are an appliance diagnostic assistant.
          Always ask exactly one question that the user can answer with "yes" or "no".
          Never ask open-ended questions. Do not repeat questions that were already asked.
          If the user answered "unknown" or the same question already
          appeared in the history, **do NOT repeat it verbatim**.
          Instead, rephrase from a different angle to get new information.
          Respond all document in Japanese.
          Constraints for "causes":
            - "prob" must be an integer 1–100 (no % sign)
            - The sum of all "prob" values MUST equal 100
          Respond ONLY with valid JSON matching this TypeScript type:
          type Result =
            | { follow_up_needed: true; sessionId: string; question: string }
            | { follow_up_needed: false; sessionId: string; final_report: {
                  causes: { name: string; prob: number }[];
                  diy_fix: string[];
                  action: "call_support" | "replace" | "monitor";
              }}.`,
        },
        { role: 'user', content: JSON.stringify(payload) },
        ...historyMsgs,
      ],
      max_tokens: 300,
      temperature: 0.4,
    });

    const json = safeJson(gpt.choices[0].message.content ?? '');
    res.status(200).json(json);
  } catch (err) {
    console.error('DIAGNOSE ERROR', err);
    res.status(500).json({ error: String(err) });
  }
}