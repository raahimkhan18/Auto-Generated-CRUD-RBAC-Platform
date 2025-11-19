import { useEffect, useState } from "react";
import axios from "axios";
import { RefreshCw, Database } from "lucide-react";

export default function ModelList({ 
  onSelect, 
  selectedModel 
}: { 
  onSelect: (m: any) => void;
  selectedModel: any;
}) {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:4000/admin/models");
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800">Models</h3>
        <button
          onClick={fetchModels}
          className="text-indigo-600 hover:text-indigo-700"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && models.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Loading models...</p>
      ) : models.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No models yet. Create one to get started!
        </p>
      ) : (
        <ul className="space-y-2">
          {models.map((m) => (
            <li key={m.name}>
              <button
                onClick={() => onSelect(m)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
                  selectedModel?.name === m.name
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 hover:bg-indigo-100 border border-gray-200'
                }`}
              >
                <Database className="w-5 h-5" />
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className={`text-xs ${selectedModel?.name === m.name ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {m.fields?.length || 0} fields
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}