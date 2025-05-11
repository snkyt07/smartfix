// src/pages/Flow.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

/* ── 型定義 ─────────────────────────────── */
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

/** 推定できなかった場合のフォールバック */
type UnknownResponse = {
  follow_up_needed: false;
  sessionId: string;
  unable: true;
  reason: 'max_depth';
};

type QuestionResponse = {
  follow_up_needed: true;
  sessionId: string;
  question: string;
};

type DiagnoseResponse = ResultResponse | QuestionResponse;

/* ── コンポーネント ─────────────────────── */
export default function Flow() {
  /* Home から渡された初回質問 */
  const { state: initial } = useLocation() as {
    state: QuestionResponse & { payload: Payload };
  };

  const navigate = useNavigate();

  /* React 状態 */
  const [data, setData] = useState<DiagnoseResponse>(initial);
  const [payload, setPayload] = useState<Payload>(initial.payload);
  const [asked, setAsked] = useState<Set<string>>(new Set([initial.question]));
  const [loading, setLoading] = useState(false);

  const MAX_DEPTH = 8;

  /* 回答ハンドラ */
  const answer = async (ans: 'yes' | 'no' | 'unknown') => {
    if (!('question' in data)) return;
    setLoading(true);

    /* 履歴を更新 */
    const newHistory: QA[] = [...payload.history, { question: data.question, answer: ans }];
    const newPayload: Payload = { ...payload, history: newHistory };

    try {
      const res: DiagnoseResponse = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: data.sessionId,
          payload: newPayload,
          historyMsgs: newHistory.flatMap(h => [
            { role: 'assistant', content: h.question },
            { role: 'user', content: h.answer },
          ]),
        }),
      }).then(r => r.json());

      /* -------- 終了判定 -------- */
      const terminate =
        !res.follow_up_needed ||        // GPT が完了を宣言
        asked.size >= MAX_DEPTH;        // 質問数上限に到達

      if (terminate) {
        alert('診断を完了します。結果を表示します。');

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

      /* -------- 続行 -------- */
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

  /* 結果待ちローディング */
  if (!('question' in data)) {
    return (
      <div className="p-6 text-center text-gray-600">
        診断レポートを生成中…
      </div>
    );
  }

  /* -------- 質問表示 -------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-[22rem] space-y-6 bg-white p-6 rounded-xl shadow">
        <p className="text-lg font-semibold">{data.question}</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => answer('yes')}
            disabled={loading}
            className="py-2 rounded text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400"
          >
            はい
          </button>

          <button
            onClick={() => answer('no')}
            disabled={loading}
            className="py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200"
          >
            いいえ
          </button>

          <button
            onClick={() => answer('unknown')}
            disabled={loading}
            className="py-2 rounded bg-yellow-300 hover:bg-yellow-400 disabled:bg-gray-200"
          >
            わからない
          </button>
        </div>
      </div>
    </div>
  );
}
