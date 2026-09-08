import { useState, useEffect } from "react";
import { api } from "../api/client";
import { LoadingState } from "../components/ui/LoadingState";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users").then((res) => {
      setUsers(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2">Active</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.id} className="border-t">
              <td className="py-2">{user.email}</td>
              <td className="py-2">{user.role}</td>
              <td className="py-2">{user.isActive ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
