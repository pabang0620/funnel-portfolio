import { useState, useEffect } from "react";
import PortfolioWidget from '@/components/landingmaker/PortfolioWidget'
import { useNavigate } from "react-router-dom";
import { LayoutListIcon } from "lucide-react";
import { getAllLandings, deleteLanding } from "./api";
import { updateLanding } from "../templatecreate/api";
import { Card } from "@/components/landingmaker/ui/card";
import { Button } from "@/components/landingmaker/ui/button";
import { TooltipProvider } from "@/components/landingmaker/ui/tooltip";
import LandingDataTable from "@/components/landingmaker/LandingDataTable";
import Header from "@/components/landingmaker/Header";
import DemoBadge from "@/components/landingmaker/DemoBadge";

export default function Dashboard() {
  const navigate = useNavigate();

  const [landings, setLandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication check - redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found. Redirecting to login...');
      navigate('/portfolio/landingmaker/login', { replace: true });
    }
  }, [navigate]);

  // 랜딩 목록 조회
  useEffect(() => {
    const fetchLandings = async () => {
      try {
        setLoading(true);

        // 실제 API 호출
        const response = await getAllLandings();
        if (response.success) {
          console.log('랜딩 목록 조회 성공:', response.data);
          setLandings(response.data);
        } else {
          setError(response.msg || "랜딩 목록을 불러오는데 실패했습니다.");
        }
      } catch (err) {
        console.error("랜딩 목록 조회 오류:", err);
        setError("랜딩 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchLandings();
  }, []);

  const handleDelete = async (adNumber) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        const response = await deleteLanding(adNumber);
        if (response.success) {
          const updatedLandings = landings.filter(
            (landing) => landing.adNumber !== adNumber
          );
          setLandings(updatedLandings);
          alert("삭제되었습니다.");
        } else {
          alert(response.msg || "삭제에 실패했습니다.");
        }
      } catch (err) {
        console.error("랜딩 삭제 오류:", err);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleStatusChange = async (adNumber, newStatus) => {
    const statusText = newStatus === 1 ? "활성화" : "비활성화";
    if (window.confirm(`정말 ${statusText}하시겠습니까?`)) {
      try {
        // FormData 생성하여 status만 전송
        const formData = new FormData();
        formData.append('landingStatus', newStatus === 1 ? 'true' : 'false');

        const response = await updateLanding(adNumber, formData);
        if (response.success) {
          const updatedLandings = landings.map((landing) =>
            landing.adNumber === adNumber
              ? { ...landing, status: newStatus }
              : landing
          );
          setLandings(updatedLandings);
          alert(`${statusText}되었습니다.`);
        } else {
          alert(response.msg || "상태 변경에 실패했습니다.");
        }
      } catch (err) {
        console.error("상태 변경 오류:", err);
        alert("상태 변경 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DemoBadge projectName="Landing Maker" />
      <Header />

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-8">
          <LayoutListIcon className="w-4 h-4 text-gray-800" />
          <h2 className="text-xl font-semibold text-gray-900">
            랜딩목록
          </h2>
        </div>

        {/* 로딩 및 에러 상태 */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* 테이블 */}
        {!loading && !error && (
          <TooltipProvider>
            <Card className="mx-auto w-full py-0">
              <LandingDataTable
                data={landings}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            </Card>
          </TooltipProvider>
        )}
      </main>

      <PortfolioWidget />
    </div>
  );
}
