const BASE = import.meta.env.VITE_API_URL;

async function handle(res) {
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export const fetchTickets = (filters = {}) => {
  const p = new URLSearchParams();
  if (filters.priority) p.set("priority", filters.priority);
  if (filters.breached) p.set("breached", "true");
  return fetch(`${BASE}/tickets?${p}`).then(handle);
};

export const fetchStats = () =>
  fetch(`${BASE}/tickets/stats`).then(handle);

export const createTicket = (data) =>
  fetch(`${BASE}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handle);

export const updateTicketStatus = (id, status) =>
  fetch(`${BASE}/tickets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).then(handle);

export const deleteTicket = (id) =>
  fetch(`${BASE}/tickets/${id}`, { method: "DELETE" }).then(handle);
