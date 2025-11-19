import { useState } from "react";
import ModelEditor from "../ModelEditor";
import ModelList from "../components/ModelList";

export default function ModelsView() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  const handleModelPublished = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Model Management</h2>
        <p className="text-gray-600 mt-1">
          Create and manage your data models
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Create Model */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ModelEditor onPublished={handleModelPublished} />
        </div>

        {/* Right: Model List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ModelList
            key={refreshKey}
            onSelect={(m) => setSelectedModel(m)}
            selectedModel={selectedModel}
          />
        </div>
      </div>

      {/* Model Details (Optional) */}
      {selectedModel && (
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Model Details: {selectedModel.name}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Fields</h4>
              <div className="space-y-2">
                {selectedModel.fields?.map((field: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {field.name}
                      </span>
                      <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {field.type}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-1 text-xs text-gray-500">
                      {field.required && (
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded">
                          Required
                        </span>
                      )}
                      {field.unique && (
                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                          Unique
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                RBAC Permissions
              </h4>
              <div className="space-y-2">
                {selectedModel.rbac &&
                  Object.entries(selectedModel.rbac).map(
                    ([role, perms]: [string, any]) => (
                      <div
                        key={role}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                      >
                        <div className="font-medium text-gray-800">{role}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {perms.map((perm: string) => (
                            <span
                              key={perm}
                              className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  )}
              </div>
              {selectedModel.ownerField && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <span className="text-sm font-medium text-amber-800">
                    Owner Field: {selectedModel.ownerField}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}