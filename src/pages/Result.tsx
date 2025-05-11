// src/pages/Result.tsx
import { useLocation, useNavigate } from 'react-router-dom';

/* ---------- 受け取り得る 2 形式 ---------- */
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

type ResultState = ResultResponse | UnknownResponse;

/* ---------- 画面コンポーネント ---------- */
export default function Result() {
  const { state } = useLocation() as { state: ResultState };
  const navigate = useNavigate();

  /* ===== フォールバック表示 ===== */
  if ('unable' in state) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-white to-blue-50">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full space-y-6 text-center">
          <h1 className="text-xl font-bold text-red-600">
            原因を推定できませんでした
          </h1>
          <p className="text-gray-700">
            {state.reason === 'max_depth'
              ? '質問回数の上限に達したため診断を終了します。'
              : '同じ回答が繰り返されたため診断を終了します。'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            最初に戻る
          </button>
        </div>
      </div>
    );
  }

  /* ===== 通常レポート表示 ===== */
  const { causes, diy_fix, action } = state.final_report;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-6 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-xl w-full space-y-6">
        <h1 className="text-2xl font-bold text-center text-blue-600">
          診断レポート
        </h1>

        {/* 原因リスト */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            考えられる原因
          </h2>
          <ul className="space-y-1">
            {causes.map((c, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>{c.name}</span>
                <span className="text-gray-500">
                  : {Math.round(c.prob)}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* DIY 対処法 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            自分で試せる対処法
          </h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {diy_fix.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>

        {/* 推奨アクション */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            推奨アクション
          </h2>
          <p className="text-blue-600 font-semibold text-center text-lg">
            {action === 'call_support' &&
              'サポートセンターへの連絡をおすすめします'}
            {action === 'replace' &&
              '修理または交換が必要な可能性があります'}
            {action === 'monitor' &&
              'しばらく様子を見て問題が続くようなら対応しましょう'}
          </p>
        </div>

        {/* 戻るボタン */}
        <div className="pt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            最初に戻る
          </button>
        </div>
      </div>
    </div>
  );
}
