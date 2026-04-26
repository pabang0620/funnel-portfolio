import React from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./layout/Layout";
import GlobalDashBoard from "./pages/GlobalDashBoard";
import SingleDashBoard from "./pages/SingleDashBoard";
import DemoBadge from "../../components/landingmaker/DemoBadge";
import "./index.css";
import "./croft-theme.css";

const queryClient = new QueryClient();

export default function CroftPage() {
  return (
    <div className="croftPage">
      <DemoBadge projectName="Croft" />
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<GlobalDashBoard />} />
            <Route path="dash" element={<SingleDashBoard />} />
          </Route>
        </Routes>
      </QueryClientProvider>
    </div>
  );
}
