import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"

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

export default function Result() {
  const { state } = useLocation() as { state: ResultState };
  const navigate = useNavigate();

  if ('unable' in state) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-white to-blue-50">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full space-y-6">
          <h1 className="text-xl font-bold text-center text-red-600">
            原因を推定できませんでした
          </h1>
          <p className="text-center text-gray-700">
            {state.reason === 'max_depth'
              ? '質問回数の上限に達したため診断を終了します。'
              : '同じ回答が繰り返されたため診断を終了します。'}
          </p>
          <div className="text-center">
            <Button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              最初に戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { causes, diy_fix, action } = state.final_report;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-6 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-xl w-full space-y-6">
        <h1 className="text-2xl font-bold text-center text-blue-600">
          診断レポート
        </h1>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">
            考えられる原因
          </h2>
          <ul className="space-y-2">
            {causes.map((c, i) => (
              <li key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-700">{c.name}</span>
                <span className="text-blue-600 font-medium">
                  {Math.round(c.prob)}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">
            自分で試せる対処法
          </h2>
          <ul className="space-y-2">
            {diy_fix.map((line, i) => (
              <li key={i} className="bg-gray-50 p-3 rounded-lg text-gray-700">
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">
            推奨アクション
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-700 font-medium text-center">
              {action === 'call_support' &&
                'サポートセンターへの連絡をおすすめします'}
              {action === 'replace' &&
                '修理または交換が必要な可能性があります'}
              {action === 'monitor' &&
                'しばらく様子を見て問題が続くようなら対応しましょう'}
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            最初に戻る
          </Button>
        </div>
      </div>
    </div>
  );
}