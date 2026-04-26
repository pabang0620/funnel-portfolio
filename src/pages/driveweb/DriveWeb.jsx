import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import DriveLog from "./pages/DriveLog";

function DriveWeb() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/portfolio/driveweb/drive" replace />} />
        <Route path="/drive" element={<DriveLog />} />
        <Route path="*" element={<Navigate to="/portfolio/driveweb/drive" replace />} />
      </Routes>
    </Layout>
  );
}

export default DriveWeb;
