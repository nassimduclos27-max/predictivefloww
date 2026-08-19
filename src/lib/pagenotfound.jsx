import React from "react";
import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-6">Page introuvable</p>
      <Link to="/" className="text-primary hover:underline">Retour à l'accueil</Link>
    </div>
  );
}
