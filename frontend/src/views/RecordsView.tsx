import { useState, useEffect } from "react";
import axios from "axios";
import RecordManager from "../RecordManager";
import { ChevronDown } from "lucide-react";

interface Props {
  currentRole: string;
}

export default function RecordsView({ currentRole }: Props) {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:4000/admin/models");
      setModels(response.data);
      // Auto-select first model if available
      if (response.data.length > 0 && !selectedModel) {
        setSelectedModel(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Records Management</h2>
        <p className="text-gray-600 mt-1">
          View and manage data for your models
        </p>
      </div>

      {/* Model Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Model
        </label>
        <div className="relative">
          <select
            value={selectedModel?.name || ""}
            onChange={(e) => {
              const model = models.find((m) => m.name === e.target.value);
              setSelectedModel(model);
            }}
            className="w-full md:w-96 appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-gray-700 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            disabled={loading || models.length === 0}
          >
            {models.length === 0 ? (
              <option>No models available</option>
            ) : (
              models.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.name} ({model.fields?.length || 0} fields)
                </option>
              ))
            )}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Records Table */}
      {models.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Models Yet
          </h3>
          <p className="text-gray-500">
            Create a model first in the Models section to manage records
          </p>
        </div>
      ) : selectedModel ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <RecordManager model={selectedModel} currentRole={currentRole} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500">Select a model to view its records</p>
        </div>
      )}
    </div>
  );
}