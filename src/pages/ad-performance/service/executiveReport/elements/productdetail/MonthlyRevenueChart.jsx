import { useState } from "react";
import { Bar, BarChart, XAxis, YAxis, Cell, ReferenceLine } from "recharts";
import { generateMonthLabels } from "../utils/dateUtils";
import { Card, CardContent } from "../../../../components/shadcn/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../../../../components/shadcn/chart";

/**
 * 월별 매출 차트 컴포넌트
 * 권한에 따라 공헌이익 표시 여부 결정
 * @param {Object} revenueData - 월별 매출 데이터
 * @param {Function} hasPermission - 권한 체크 함수
 * @param {boolean} isAdmin - 관리자 여부
 */
const MonthlyRevenueChart = ({
  revenueData,
  hasPermission = () => true,
  isAdmin = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // 권한 기반 공헌이익 표시 여부
  const canShowProfit =
    isAdmin || hasPermission("executive-report-product_chart-box_chart-profit");

  // 권한이 없으면 숨김
  const shouldHideProfit = !canShowProfit;

  const actualData = revenueData || { revenue: [], profit: [] };
  const labels = generateMonthLabels();

  // recharts 데이터 형식으로 변환
  const chartData = labels.map((label, index) => ({
    month: label,
    revenue: actualData.revenue[index] || 0,
    profit: actualData.profit[index] || 0,
  }));

  // evil-chart 기본 색상 사용
  const chartConfig = {
    revenue: {
      label: "매출",
      color: "var(--chart-1)",
    },
    ...(shouldHideProfit
      ? {}
      : {
          profit: {
            label: "공헌이익",
            color: "var(--chart-2)",
          },
        }),
  };

  return (
    <Card
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <CardContent style={{ padding: "24px" }}>
        <ChartContainer
          config={chartConfig}
          style={{ height: "300px", width: "100%" }}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            onMouseLeave={() => setActiveIndex(null)}
            margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
            barCategoryGap="20%"
          >
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{
                fill: "#6b7280",
                fontSize: 12,
                fontFamily: "inherit",
              }}
              tickFormatter={(value) =>
                value.replace("(진행중)", "").replace(" 예상", "")
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "#6b7280",
                fontSize: 12,
                fontFamily: "inherit",
              }}
              tickFormatter={(value) => value.toLocaleString()}
              width={80}
            />
            <ReferenceLine y={0} stroke="#d1d5db" strokeWidth={1} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <ChartLegend
              verticalAlign="top"
              content={<ChartLegendContent verticalAlign="top" />}
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4}>
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-revenue-${index}`}
                  fillOpacity={
                    activeIndex === null ? 1 : activeIndex === index ? 1 : 0.3
                  }
                  stroke={activeIndex === index ? "var(--color-revenue)" : ""}
                  onMouseEnter={() => setActiveIndex(index)}
                  className="transition-opacity duration-200"
                />
              ))}
            </Bar>
            {!shouldHideProfit && (
              <Bar dataKey="profit" fill="var(--color-profit)" radius={4}>
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-profit-${index}`}
                    fillOpacity={
                      activeIndex === null ? 1 : activeIndex === index ? 1 : 0.3
                    }
                    stroke={activeIndex === index ? "var(--color-profit)" : ""}
                    onMouseEnter={() => setActiveIndex(index)}
                    className="transition-opacity duration-200"
                  />
                ))}
              </Bar>
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyRevenueChart;
