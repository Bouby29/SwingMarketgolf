import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function Section({ title, children, collapsible = false }) {
  const [open, setOpen] = useState(true);

  if (collapsible) {
    return (
      <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
        >
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
        {open && <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed space-y-3">{children}</div>}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#1B5E20] mb-4 pb-2 border-b border-green-100">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export function SubSection({ title, children }) {
  return (
    <div className="mb-4">
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export function InfoBox({ children, color = "green" }) {
  const colors = {
    green: "bg-green-50 border-green-200 text-green-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
  };
  return (
    <div className={`rounded-xl border p-4 text-sm ${colors[color]}`}>{children}</div>
  );
}

export function DataTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 my-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-gray-600 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}