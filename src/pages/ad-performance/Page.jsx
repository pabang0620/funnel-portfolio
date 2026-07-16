import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./service/login/Page";
import ExecutiveReport from "./service/executiveReport/Page";
import MarketingReport from "./service/marketingreport/Page";
import MediaOperations from "./service/mediaoperations/Page";
import DataEntryStatus from "./service/dataentrystatus/Page";
import DataEntryHistory from "./service/dataentrystatus/DataEntryHistory";
import CustomerManagement from "./service/customermanagement/Page";
import AccountCreation from "./service/admin/accountcreation/Page";
import ProductManagement from "./service/admin/product-management/Page";
import MarketplaceAdmedia from "./service/admin/marketplace-admedia/Page";
import PermissionSettings from "./service/admin/permissionsettings/Page";
import DailyQuotes from "./service/admin/dailyquotes/Page";
import CSDataPage from "./service/csdata/Page";
import CSShippingPage from "./service/csdata/ShippingPage";
import SalesOrders from "./service/salesorders/Page";
import PreviewPage from "./pages/PreviewPage";

function Page() {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/executive-report"
            element={
              <ProtectedRoute pageId="executive-report-sales">
                <ExecutiveReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing-report"
            element={
              <ProtectedRoute pageId="marketing-report">
                <MarketingReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/media-operations"
            element={
              <ProtectedRoute pageId="media-operations">
                <MediaOperations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data-entry-status"
            element={
              <ProtectedRoute pageId="data-entry-status">
                <DataEntryStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data-entry-history"
            element={
              <ProtectedRoute pageId="data-entry-status">
                <DataEntryHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-management"
            element={
              <ProtectedRoute pageId="customer-management">
                <CustomerManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management-resources"
            element={
              <Navigate to="/management-resources/account-creation" replace />
            }
          />
          <Route
            path="/management-resources/account-creation"
            element={
              <ProtectedRoute pageId="admin-account">
                <AccountCreation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management-resources/product-management"
            element={
              <ProtectedRoute pageId="admin-product-management">
                <ProductManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management-resources/marketplace-admedia"
            element={
              <ProtectedRoute pageId="admin-marketplace-admedia">
                <MarketplaceAdmedia />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management-resources/permission-settings"
            element={
              <ProtectedRoute pageId="admin-permissions">
                <PermissionSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management-resources/daily-quotes"
            element={
              <ProtectedRoute pageId="admin-daily-quotes">
                <DailyQuotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cs-management/data"
            element={
              <ProtectedRoute pageId="cs-data">
                <CSDataPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cs-management/shipping"
            element={
              <ProtectedRoute pageId="cs-data">
                <CSShippingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sales-orders"
            element={
              <ProtectedRoute pageId="sales-orders" requiredRole="S">
                <SalesOrders />
              </ProtectedRoute>
            }
          />
          <Route path="/preview" element={<PreviewPage />} />
          </Routes>
        </BrowserRouter>
      </PermissionsProvider>
    </AuthProvider>
  );
}

export default Page;
