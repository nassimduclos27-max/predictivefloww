import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between">
      <span className="font-bold text-lg">PredictiveFlow</span>
      <div className="flex gap-4 text-sm">
        <Link to="/" className="hover:underline">Dashboard</Link>
        <Link to="/machines" className="hover:underline">Machines</Link>
        <Link to="/alertes" className="hover:underline">Alertes</Link>
        {user?.role === "admin" && (
          <Link to="/admin" className="hover:underline">Admin</Link>
        )}
        <button onClick={handleLogout} className="hover:underline">Déconnexion</button>
      </div>
    </nav>
  );
}
