import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Edit2, Trash2, X, Save, RefreshCw, AlertCircle } from "lucide-react";

export default function RecordManager({ 
  model, 
  currentRole 
}: { 
  model: any; 
  currentRole: string;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState<string>("");

  const table = model.tableName || model.name.toLowerCase() + "s";
  const endpoint = `http://localhost:4000/api/${table}`;

  // Get current user's permissions for this model
  const userPermissions = model.rbac?.[currentRole] || [];
  const canCreate = userPermissions.includes('all') || userPermissions.includes('create');
  const canRead = userPermissions.includes('all') || userPermissions.includes('read');
  const canUpdate = userPermissions.includes('all') || userPermissions.includes('update');
  const canDelete = userPermissions.includes('all') || userPermissions.includes('delete');

  const fetchRecords = async () => {
    if (!canRead) {
      setError(`${currentRole} role does not have READ permission`);
      setRows([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.get(endpoint, {
        headers: {
          "x-user-id": "user123",
          "x-user-roles": currentRole,
        },
      });
      setRows(response.data);
    } catch (error: any) {
      console.error("Error fetching records:", error);
      const errorMsg = error.response?.data?.error || error.message;
      setError(`Failed to fetch records: ${errorMsg}`);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (model) {
      fetchRecords();
      setIsAdding(false);
      setEditingRow(null);
    }
  }, [model, currentRole]);

  const handleAdd = () => {
    if (!canCreate) {
      alert(`❌ ${currentRole} role does not have CREATE permission`);
      return;
    }

    const initial: any = {};
    model.fields.forEach((f: any) => {
      if (f.default !== undefined) initial[f.name] = f.default;
      else if (f.type === 'boolean') initial[f.name] = false;
      else if (f.type === 'number') initial[f.name] = 0;
      else initial[f.name] = '';
    });
    if (model.ownerField) {
      initial[model.ownerField] = 'user123';
    }
    setFormData(initial);
    setIsAdding(true);
    setEditingRow(null);
    setError("");
  };

  const handleEdit = (row: any) => {
    if (!canUpdate) {
      alert(`❌ ${currentRole} role does not have UPDATE permission`);
      return;
    }

    setFormData({ ...row });
    setEditingRow(row);
    setIsAdding(false);
    setError("");
  };

  const handleSave = async () => {
    setError("");
    try {
      if (isAdding) {
        if (!canCreate) {
          throw new Error(`${currentRole} role does not have CREATE permission`);
        }
        await axios.post(endpoint, formData, {
          headers: {
            "x-user-id": "user123",
            "x-user-roles": currentRole,
          },
        });
        alert("✅ Record created successfully");
      } else {
        if (!canUpdate) {
          throw new Error(`${currentRole} role does not have UPDATE permission`);
        }
        await axios.put(`${endpoint}/${editingRow.id}`, formData, {
          headers: {
            "x-user-id": "user123",
            "x-user-roles": currentRole,
          },
        });
        alert("✅ Record updated successfully");
      }
      fetchRecords();
      setIsAdding(false);
      setEditingRow(null);
      setFormData({});
    } catch (error: any) {
      console.error("Error saving record:", error);
      const errorMsg = error.response?.data?.error || error.message;
      setError(errorMsg);
      alert(`❌ Error: ${errorMsg}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDelete) {
      alert(`❌ ${currentRole} role does not have DELETE permission`);
      return;
    }

    if (!confirm("Are you sure you want to delete this record?")) return;
    
    setError("");
    try {
      await axios.delete(`${endpoint}/${id}`, {
        headers: {
          "x-user-id": "user123",
          "x-user-roles": currentRole,
        },
      });
      alert("✅ Record deleted successfully");
      fetchRecords();
    } catch (error: any) {
      console.error("Error deleting record:", error);
      const errorMsg = error.response?.data?.error || error.message;
      setError(errorMsg);
      alert(`❌ Error: ${errorMsg}`);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingRow(null);
    setFormData({});
    setError("");
  };

  const renderFormField = (field: any) => {
    const value = formData[field.name] ?? '';

    switch (field.type) {
      case 'boolean':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">{field.name}</span>
          </label>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: parseFloat(e.target.value) || 0 })}
            placeholder={field.name}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        );
      case 'text':
        return (
          <textarea
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={field.name}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={field.name}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-indigo-600">
            {model?.name} Records
          </h3>
          <div className="flex gap-2 mt-2 text-sm">
            <span className={`px-2 py-1 rounded ${canCreate ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {canCreate ? '✓' : '✗'} Create
            </span>
            <span className={`px-2 py-1 rounded ${canRead ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {canRead ? '✓' : '✗'} Read
            </span>
            <span className={`px-2 py-1 rounded ${canUpdate ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {canUpdate ? '✓' : '✗'} Update
            </span>
            <span className={`px-2 py-1 rounded ${canDelete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {canDelete ? '✓' : '✗'} Delete
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchRecords}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canCreate && (
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add Record
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800">Access Denied</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingRow) && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h4 className="font-semibold text-lg mb-4">
            {isAdding ? "Add New Record" : "Edit Record"}
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {model.fields.map((field: any) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.name} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderFormField(field)}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" /> Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="overflow-x-auto">
        {!canRead ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-800 font-semibold">No Read Permission</p>
            <p className="text-sm text-yellow-700">
              The {currentRole} role does not have permission to view records.
            </p>
          </div>
        ) : loading ? (
          <p className="text-gray-500 text-center py-8">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No records found. {canCreate ? "Create one to get started!" : ""}
          </p>
        ) : (
          <table className="min-w-full text-sm text-gray-600 border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-indigo-500 text-white">
              <tr>
                {Object.keys(rows[0]).map((key) => (
                  <th key={key} className="px-4 py-3 text-left font-semibold">
                    {key}
                  </th>
                ))}
                {(canUpdate || canDelete) && (
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="px-4 py-3">
                      {typeof val === 'boolean' ? (val ? '✓' : '✗') : String(val)}
                    </td>
                  ))}
                  {(canUpdate || canDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {canUpdate && (
                          <button
                            onClick={() => handleEdit(row)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}