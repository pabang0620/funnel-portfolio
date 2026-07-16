import Layout from "../../components/Layout";
import Breadcrumb from "../../components/Breadcrumb";
import ComingSoonOverlay from "../../components/ui/ComingSoonOverlay";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import "./CustomerManagement.css";

function CustomerManagement() {
  return (
    <Layout>
      <div
        className="customer-management-container"
        style={{ position: "relative" }}
      >
        <Breadcrumb />
        <h1 className="page-title">고객 관리</h1>
        <p>Customer Management</p>

        <ComingSoonOverlay
          title="고객 관리"
          subtitle="현재 이 페이지는 기획 전입니다."
          icon={faUsers}
        />
      </div>
    </Layout>
  );
}

export default CustomerManagement;
