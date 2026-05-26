import { useState } from "react";
import { createTicket } from "../api";

const EMPTY = { subject: "", description: "", customerEmail: "", priority: "medium" };

export default function CreateTicketModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const handleSubmit = async () => {
    setApiError("");
    setLoading(true);
    try {
      const ticket = await createTicket(form);
      onCreated(ticket);
    } catch (e) {
      if (e.fields) setErrors(e.fields);
      else setApiError(e.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "subject", label: "Subject", type: "text", placeholder: "Brief summary of the issue" },
    { name: "customerEmail", label: "Customer Email", type: "email", placeholder: "customer@example.com" },
  ];

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-800 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-bold text-white">New Support Ticket</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {apiError && (
            <p className="text-red-400 text-sm bg-red-950/50 border border-red-800 px-3 py-2 rounded-lg">
              {apiError}
            </p>
          )}

          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{f.label}</label>
              <input
                name={f.name}
                type={f.type}
                value={form[f.name]}
                onChange={set}
                placeholder={f.placeholder}
                className={`w-full bg-gray-800 text-white text-sm px-3 py-2.5 rounded-xl border focus:outline-none focus:border-indigo-500 transition-colors ${
                  errors[f.name] ? "border-red-500" : "border-gray-700"
                }`}
              />
              {errors[f.name] && (
                <p className="text-red-400 text-xs mt-1">{errors[f.name]}</p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={set}
              rows={3}
              placeholder="Detailed description of the issue..."
              className={`w-full bg-gray-800 text-white text-sm px-3 py-2.5 rounded-xl border focus:outline-none focus:border-indigo-500 resize-none transition-colors ${
                errors.description ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={set}
              className="w-full bg-gray-800 text-white text-sm px-3 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="low">Low — 72h SLA</option>
              <option value="medium">Medium — 24h SLA</option>
              <option value="high">High — 4h SLA</option>
              <option value="urgent">Urgent — 1h SLA</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-800 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            {loading ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}
