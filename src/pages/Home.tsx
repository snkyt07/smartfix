import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
          SmartFix 家電診断
        </h1>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">診断する機器</label>
            <Select value={device} onValueChange={(value: 'refrigerator' | 'washing_machine') => setDevice(value)}>
              <SelectTrigger>
                <SelectValue placeholder="機器を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="refrigerator">冷蔵庫</SelectItem>
                <SelectItem value="washing_machine">洗濯機</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">症状を入力</label>
            <textarea
              value={symptom}
              onChange={e => setSymptom(e.target.value)}
              placeholder="例: 冷えが弱い / 異音がする…"
              className="w-full min-h-[120px] px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <Button
            onClick={handleStart}
            disabled={!symptom || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? '診断中…' : '診断を開始'}
          </Button>
        </div>
      </div>
    </div>
  );
}