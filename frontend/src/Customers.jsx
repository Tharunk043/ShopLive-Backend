import { useState } from "react";
import { apiFetch } from "./api";

export default function Customers({ onLogout }) {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);

  async function handleSearch() {
    const res = await apiFetch(`/customer?search=${search}`);

    if (res.status === 401) {
      alert("Session expired. Please login again.");
      onLogout();
      return;
    }

    const data = await res.json();
    setCustomers(data);
  }

  return (
    <div>
      <button onClick={onLogout} style={{ float: "right" }}>
        Logout
      </button>

      <h3>Search Customers</h3>

      <input
        placeholder="Search by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      <hr />

      {customers.map((c) => (
        <div
          key={c.id}
          style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
        >
          <strong>{c.name}</strong>

          <ul>
            {c.orderList?.map((o) => (
              <li key={o.id}>
                {o.name} (Qty: {o.count})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
