import { useLocation, useNavigate } from 'react-router-dom';

type ResultResponse = {
  follow_up_needed: false;
  sessionId: string;
  final_report: {
    causes: { name: string; prob: number }[];
    diy_fix: string[];
    action: 'call_support' | 'replace' | 'monitor';
  };
};

export default function Result() {
  const { state } = useLocation() as { state: ResultResponse };
  const navigate = useNavigate();

  const { causes, diy_fix, action } = state.final_report;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-6 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-xl w-full space-y-6">
        <h1 className="text-2xl font-bold text-center text-blue-600">診断レポート</h1>

        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">考えられる原因</h2>
          <ul className="space-y-1">
            {causes.map((c, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>{c.name}</span>
                <span className="text-gray-500">{Math.round(c.prob * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">自分で試せる対処法</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {diy_fix.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">推奨アクション</h2>
          <p className="text-blue-600 font-semibold text-center text-lg">
            {action === 'call_support' && 'サポートセンターへの連絡をおすすめします'}
            {action === 'replace' && '修理または交換が必要な可能性があります'}
            {action === 'monitor' && 'しばらく様子を見て問題が続くようなら対応しましょう'}
          </p>
        </div>

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
