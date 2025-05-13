import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from "@/components/ui/button"

type QA = { question: string; answer: 'yes' | 'no' | 'unknown' };

type Payload = {
  device: string;
  symptom: string;
  history: QA[];
};

type ResultResponse = {
  follow_up_needed: false;
  sessionId: string;
  final_report: {
    causes: { name: string; prob: number }[];
    diy_fix: string[];
    action: 'call_support' | 'replace' | 'monitor';
  };
};

type UnknownResponse = {
  follow_up_needed: false;
  sessionId: string;
  unable: true;
  reason: 'max_depth' | 'repeat';
};

type QuestionResponse = {
  follow_up_needed: true;
  sessionId: string;
  question: string;
};

type DiagnoseResponse = ResultResponse | QuestionResponse;

export default function Flow() {
  const { state: initial } = useLocation() as {
    state: QuestionResponse & { payload: Payload };
  };

  const navigate = useNavigate();

  const [data, setData] = useState<DiagnoseResponse>(initial);
  const [payload, setPayload] = useState<Payload>(initial.payload);
  const [asked, setAsked] = useState<Set<string>>(new Set([initial.question]));
  const [repeatCnt, setRepeatCnt] = useState(0);
  const [loading, setLoading] = useState(false);

  const MAX_DEPTH = 12;
  const MAX_REPEAT = 3;

  const fetchNext = async (newPayload: Payload, sessionId: string): Promise<DiagnoseResponse> =>
    fetch('/api/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        payload: newPayload,
        historyMsgs: newPayload.history.flatMap(h => [
          { role: 'assistant', content: h.question },
          { role: 'user', content: h.answer },
        ]),
      }),
    }).then(r => r.json());

  const answer = async (ans: 'yes' | 'no' | 'unknown') => {
    if (!('question' in data)) return;
    setLoading(true);

    const newHistory: QA[] = [...payload.history, { question: data.question, answer: ans }];
    const newPayload: Payload = { ...payload, history: newHistory };

    try {
      const res = await fetchNext(newPayload, data.sessionId);

      const terminate =
        !res.follow_up_needed ||
        asked.size >= MAX_DEPTH;

      if (terminate) {
        const fallback: UnknownResponse = {
          follow_up_needed: false,
          sessionId: data.sessionId,
          unable: true,
          reason: 'max_depth',
        };
        navigate('/result', {
          state: res.follow_up_needed ? fallback : (res as ResultResponse),
        });
        return;
      }

      if (asked.has(res.question ?? '')) {
        setRepeatCnt(c => c + 1);

        if (repeatCnt + 1 >= MAX_REPEAT) {
          const fallback: UnknownResponse = {
            follow_up_needed: false,
            sessionId: data.sessionId,
            unable: true,
            reason: 'repeat',
          };
          navigate('/result', { state: fallback });
          return;
        }

        await answer('unknown');
        return;
      }

      setRepeatCnt(0);
      setData(res);
      setPayload(newPayload);
      setAsked(prev => new Set(prev).add(res.question));
    } catch (err) {
      console.error('Flow answer error', err);
      alert('診断 API 通信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!('question' in data)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-gray-600">
          診断レポートを生成中…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-[22rem] space-y-6 bg-white p-8 rounded-xl shadow-lg">
        <p className="text-lg font-medium text-gray-800">{data.question}</p>

        <div className="space-y-3">
          <Button
            onClick={() => answer('yes')}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            はい
          </Button>

          <Button
            onClick={() => answer('no')}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            いいえ
          </Button>

          <Button
            onClick={() => answer('unknown')}
            disabled={loading}
            variant="secondary"
            className="w-full"
          >
            わからない
          </Button>
        </div>
      </div>
    </div>
  );
}