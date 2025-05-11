import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type DiagnoseRequest = {
  sessionId: string | null;
  payload: {
    device: string;
    symptom: string;
    history: { question: string; answer: 'yes' | 'no' | 'unknown' }[];
  };
};

export default function Home() {
  const [device, setDevice] = useState<'refrigerator' | 'washing_machine'>('refrigerator');
  const [symptom, setSymptom] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStart = async () => {
    if (!symptom) return;
    setLoading(true);
    try {
      const req: DiagnoseRequest = {
        sessionId: null,
        payload: { device, symptom, history: [] }
      };
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      navigate('/flow', { state: { ...data, payload: req.payload } });
    } catch {
      alert('通信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          SmartFix 家電診断test
        </h1>
        <div className="grid grid-cols-1 gap-y-8">
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">診断する機器</label>
            <select
              value={device}
              onChange={e => setDevice(e.target.value as any)}
              className="border border-gray-300 rounded-lg p-3 hover:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
            >
              <option value="refrigerator">冷蔵庫</option>
              <option value="washing_machine">洗濯機</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">症状を入力</label>
            <textarea
              value={symptom}
              onChange={e => setSymptom(e.target.value)}
              placeholder="例: 冷えが弱い / 異音がする…"
              className="border border-gray-300 rounded-lg p-3 h-32 resize-none hover:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
          <button
            onClick={handleStart}
            disabled={!symptom || loading}
            className="w-full py-3 rounded-lg text-white font-semibold bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 transition"
          >
            {loading ? '診断中…' : '診断を開始'}
          </button>
        </div>
      </div>
    </div>
  );
}