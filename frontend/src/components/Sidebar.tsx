import { Database, Layers } from "lucide-react";

interface Props {
  currentView: "models" | "records";
  onViewChange: (view: "models" | "records") => void;
}

export default function Sidebar({ currentView, onViewChange }: Props) {
  return (
    <aside className="w-64 bg-indigo-600 text-white flex flex-col shadow-xl">
      <div className="p-6 text-2xl font-semibold border-b border-indigo-500">
        RBAC Platform
      </div>
      <nav className="flex-1 p-4 space-y-3">
        <button
          onClick={() => onViewChange("models")}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition ${
            currentView === "models" ? "bg-indigo-800 shadow-lg" : "hover:bg-indigo-500"
          }`}
        >
          <Database className="w-5 h-5 mr-3" />
          <span className="font-medium">Models</span>
        </button>
        
        <button
          onClick={() => onViewChange("records")}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition ${
            currentView === "records" ? "bg-indigo-800 shadow-lg" : "hover:bg-indigo-500"
          }`}
        >
          <Layers className="w-5 h-5 mr-3" />
          <span className="font-medium">Records</span>
        </button>
      </nav>
      <div className="p-4 text-center border-t border-indigo-500 text-sm opacity-75">
        © 2025 RBAC Platform
      </div>
    </aside>
  );
}