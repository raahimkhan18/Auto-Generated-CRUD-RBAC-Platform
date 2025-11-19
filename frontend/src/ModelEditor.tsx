import { useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Save, Shield } from 'lucide-react';

interface Field {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'text' | 'date';
  required: boolean;
  unique: boolean;
  default?: any;
}

interface RolePermissions {
  Admin: string[];
  Manager: string[];
  Viewer: string[];
  Owner: string[];
}

export default function ModelEditor({ onPublished }: { onPublished?: () => void }) {
  const [name, setName] = useState('');
  const [tableName, setTableName] = useState('');
  const [fields, setFields] = useState<Field[]>([
    { name: 'title', type: 'string', required: true, unique: false }
  ]);
  const [ownerField, setOwnerField] = useState('ownerId');
  
  // Pre-filled role permissions with defaults
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({
    Admin: ['all'],
    Manager: ['create', 'read', 'update'],
    Viewer: ['read'],
    Owner: ['read', 'update', 'delete'] // Only their own records
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addField = () => {
    setFields([...fields, { name: '', type: 'string', required: false, unique: false }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof Field, value: any) => {
    const updated = [...fields];
    (updated[index] as any)[key] = value;
    setFields(updated);
  };

  const togglePermission = (role: keyof RolePermissions, permission: string) => {
    setRolePermissions(prev => {
      const current = prev[role];
      
      // If toggling 'all', clear other permissions
      if (permission === 'all') {
        return {
          ...prev,
          [role]: current.includes('all') ? [] : ['all']
        };
      }
      
      // If 'all' is selected, remove it when selecting specific permissions
      const withoutAll = current.filter(p => p !== 'all');
      
      if (current.includes(permission)) {
        return {
          ...prev,
          [role]: withoutAll.filter(p => p !== permission)
        };
      } else {
        return {
          ...prev,
          [role]: [...withoutAll, permission]
        };
      }
    });
  };

  const publish = async () => {
    setError('');
    if (!name.trim()) {
      setError('Model name is required');
      return;
    }
    if (fields.length === 0) {
      setError('At least one field is required');
      return;
    }
    if (fields.some(f => !f.name.trim())) {
      setError('All fields must have a name');
      return;
    }

    setLoading(true);
    try {
      // Build RBAC object, only include roles with permissions
      const rbac: Record<string, string[]> = {};
      Object.entries(rolePermissions).forEach(([role, perms]) => {
        if (perms.length > 0) {
          rbac[role] = perms;
        }
      });

      const model = {
        name: name.trim(),
        tableName: tableName.trim() || undefined,
        fields: fields.map(f => ({
          name: f.name,
          type: f.type,
          required: f.required || undefined,
          unique: f.unique || undefined,
          default: f.default || undefined
        })),
        ownerField: ownerField.trim() || undefined,
        rbac
      };

      await axios.post('http://localhost:4000/admin/models/publish', model);
      alert(`✅ Model "${name}" published successfully!`);
      
      // Reset form
      setName('');
      setTableName('');
      setFields([{ name: 'title', type: 'string', required: true, unique: false }]);
      setOwnerField('ownerId');
      setRolePermissions({
        Admin: ['all'],
        Manager: ['create', 'read', 'update'],
        Viewer: ['read'],
        Owner: ['read', 'update', 'delete']
      });
      
      onPublished?.();
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Failed to publish model');
    } finally {
      setLoading(false);
    }
  };

  const availablePermissions = ['all', 'create', 'read', 'update', 'delete'];
  
  const roleDescriptions = {
    Admin: 'Full access — can create, read, update, delete, and define models',
    Manager: 'Can create, read, and update (no delete, limited to permitted/own data)',
    Viewer: 'Read-only access',
    Owner: 'Can manage their own records only (uses ownerField)'
  };

  const roleColors = {
    Admin: 'bg-purple-100 border-purple-300 text-purple-800',
    Manager: 'bg-blue-100 border-blue-300 text-blue-800',
    Viewer: 'bg-green-100 border-green-300 text-green-800',
    Owner: 'bg-amber-100 border-amber-300 text-amber-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-indigo-600" />
        <h3 className="text-2xl font-bold text-gray-800">Create Model</h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Model Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Employee, Product"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Table Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Table Name (optional)
        </label>
        <input
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="defaults to lowercase plural"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Fields */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Fields <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addField}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <Plus className="w-4 h-4" /> Add Field
          </button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {fields.map((field, index) => (
            <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
              <input
                type="text"
                placeholder="Field name"
                value={field.name}
                onChange={(e) => updateField(index, 'name', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <select
                value={field.type}
                onChange={(e) => updateField(index, 'type', e.target.value)}
                className="border border-gray-300 rounded px-2 py-2 text-sm"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="text">Text</option>
                <option value="date">Date</option>
              </select>
              <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(index, 'required', e.target.checked)}
                />
                Required
              </label>
              <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={field.unique}
                  onChange={(e) => updateField(index, 'unique', e.target.checked)}
                />
                Unique
              </label>
              <button
                type="button"
                onClick={() => removeField(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Owner Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Owner Field (for ownership-based access control)
        </label>
        <input
          type="text"
          value={ownerField}
          onChange={(e) => setOwnerField(e.target.value)}
          placeholder="e.g., ownerId, userId, createdBy"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          This field will be used to determine record ownership for the Owner role
        </p>
      </div>

      {/* RBAC Permissions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Role-Based Access Control (RBAC)
        </label>
        
        <div className="space-y-3">
          {(Object.keys(rolePermissions) as Array<keyof RolePermissions>).map((role) => (
            <div
              key={role}
              className={`border rounded-lg p-4 ${roleColors[role]}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-sm">{role}</h4>
                  <p className="text-xs opacity-80 mt-0.5">
                    {roleDescriptions[role]}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-3">
                {availablePermissions.map((perm) => {
                  const isChecked = rolePermissions[role].includes(perm);
                  const isDisabled = 
                    rolePermissions[role].includes('all') && perm !== 'all';
                  
                  return (
                    <label
                      key={perm}
                      className={`flex items-center gap-2 text-sm ${
                        isDisabled ? 'opacity-50' : 'cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(role, perm)}
                        disabled={isDisabled}
                        className="rounded"
                      />
                      <span className="font-medium capitalize">{perm}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <strong>Note:</strong> Only Admins can create or publish models. Selecting "all" grants full access to that role.
        </div>
      </div>

      <button
        onClick={publish}
        disabled={loading}
        className="w-full bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        {loading ? 'Publishing...' : 'Publish Model'}
      </button>
    </div>
  );
}