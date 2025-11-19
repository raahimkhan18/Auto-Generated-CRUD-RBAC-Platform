import React, { useState } from "react";

interface Props {
  onAddModel: (model: any) => void;
}

const ModelForm: React.FC<Props> = ({ onAddModel }) => {
  const [modelName, setModelName] = useState("");
  const [fields, setFields] = useState([{ name: "", type: "string" }]);

  const handleAddField = () =>
    setFields([...fields, { name: "", type: "string" }]);

  const handleChange = (index: number, key: string, value: string) => {
    const updated = [...fields];
    (updated[index] as any)[key] = value;
    setFields(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName) return;
    onAddModel({ name: modelName, fields });
    setModelName("");
    setFields([{ name: "", type: "string" }]);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Create Model</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Model Name"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <div className="space-y-3">
          <p className="font-medium text-gray-600">Fields</p>
          {fields.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder="Field Name"
                value={f.name}
                onChange={(e) => handleChange(i, "name", e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <select
                value={f.type}
                onChange={(e) => handleChange(i, "type", e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
              </select>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddField}
            className="text-blue-600 hover:underline text-sm"
          >
            + Add Field
          </button>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Publish Model
        </button>
      </form>
    </div>
  );
};

export default ModelForm;
