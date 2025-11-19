import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ModelEditor from "./ModelEditor";
import ModelList from "./components/ModelList";
import RecordManager from "./RecordManager";
import axios from "axios";

function App() {
  const [currentView, setCurrentView] = useState<"models" | "records">("models");
  const [currentRole, setCurrentRole] = useState<string>("Admin");
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch models for records view
  React.useEffect(() => {
    if (currentView === "records") {
      axios.get("http://localhost:4000/admin/models")
        .then(r => {
          setModels(r.data);
          if (r.data.length > 0 && !selectedModel) {
            setSelectedModel(r.data[0]);
          }
        })
        .catch(() => setModels([]));
    }
  }, [currentView, refreshKey]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex flex-col flex-1">
        <Topbar currentRole={currentRole} onRoleChange={setCurrentRole} />
        <main className="flex-1 p-6 overflow-auto">
          
          {/* MODELS VIEW */}
          {currentView === "models" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Models</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <ModelEditor onPublished={() => setRefreshKey(prev => prev + 1)} />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <ModelList 
                    key={refreshKey}
                    onSelect={(m) => setSelectedModel(m)} 
                    selectedModel={selectedModel}
                  />
                </div>
              </div>
            </div>
          )}

          {/* RECORDS VIEW */}
          {currentView === "records" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Records</h2>
              
              {/* Model Selector */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Model
                </label>
                <select
                  value={selectedModel?.name || ""}
                  onChange={(e) => {
                    const model = models.find((m) => m.name === e.target.value);
                    setSelectedModel(model);
                  }}
                  className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {models.length === 0 ? (
                    <option>No models available</option>
                  ) : (
                    models.map((model) => (
                      <option key={model.name} value={model.name}>
                        {model.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Records Table */}
              {models.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <p className="text-gray-500">No models found. Create a model first.</p>
                </div>
              ) : selectedModel ? (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <RecordManager model={selectedModel} currentRole={currentRole} />
                </div>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;