import React from "react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
