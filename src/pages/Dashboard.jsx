import React from "react";

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">MTTF</p>
          <p className="text-2xl font-bold text-blue-600">--</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">MTBF</p>
          <p className="text-2xl font-bold text-green-600">--</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">MTTR</p>
          <p className="text-2xl font-bold text-orange-600">--</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Disponibilité</p>
          <p className="text-2xl font-bold text-purple-600">--</p>
        </div>
      </div>
    </div>
  );
}

