import { useEffect, useState } from "react";
import axios from "axios";

export default function RecordList({ model }: { model: any }) {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!model) return;
    const table = model.tableName || model.name.toLowerCase() + "s";
    axios
      .get(`http://localhost:4000/api/${table}`, {
        headers: { "x-user-id": "admin1", "x-user-roles": "Admin" },
      })
      .then((r) => setRows(r.data))
      .catch(() => setRows([]));
  }, [model]);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-indigo-600">
        {model?.name} Records
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-600 border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-indigo-500 text-white">
            <tr>
              {rows.length > 0 &&
                Object.keys(rows[0]).map((key) => (
                  <th key={key} className="px-4 py-2 text-left">
                    {key}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                {Object.values(row).map((val, j) => (
                  <td key={j} className="px-4 py-2">
                    {String(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="text-gray-500 text-center py-4">No records found.</p>
        )}
      </div>
    </div>
  );
}
