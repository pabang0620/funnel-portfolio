import React, { useState, useEffect, useRef, useCallback } from "react";
import GridLayout from "react-grid-layout";
import GridData from "./GridData";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const WonhoGrid = ({ editMode, layout, setLayout }) => {
  const [wonhoGridData, setWonhoGridData] = useState([]);
  const [chartInstances, setChartInstances] = useState({});
  const [gridWidth, setGridWidth] = useState(1200);
  const containerRef = useRef(null);

  // 컨테이너 너비 감지
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setGridWidth(Math.max(800, width - 40));
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // 초기화 - 모든 아이템 표시
  useEffect(() => {
    const defaultLayout = GridData.map((item) => ({
      ...item.layout,
      i: item.id.toString(),
    }));
    setLayout(defaultLayout);
    setWonhoGridData(GridData);
  }, [setLayout]);

  // 차트 리사이즈 핸들러
  const resizeCharts = useCallback(() => {
    requestAnimationFrame(() => {
      Object.values(chartInstances).forEach((chart) => {
        if (chart && chart.resize) {
          chart.resize();
        }
      });
    });
  }, [chartInstances]);

  const onLayoutChange = useCallback((newLayout) => {
    setLayout(newLayout);

    setWonhoGridData((prev) =>
      prev.map((item) => {
        const newItemLayout = newLayout.find(
          (layoutItem) => layoutItem.i === item.id.toString()
        );
        return newItemLayout ? { ...item, layout: newItemLayout } : item;
      })
    );

    resizeCharts();
  }, [setLayout, resizeCharts]);

  const onResizeStop = useCallback(() => {
    resizeCharts();
  }, [resizeCharts]);

  const registerChart = useCallback((key, instance) => {
    setChartInstances((prev) => ({ ...prev, [key]: instance }));
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <GridLayout
        className="layout select-none"
        cols={12}
        rowHeight={90}
        width={gridWidth}
        onLayoutChange={onLayoutChange}
        onResizeStop={onResizeStop}
        isDraggable={editMode}
        isResizable={editMode}
        margin={[16, 16]}
        containerPadding={[16, 16]}
        useCSSTransforms={true}
        compactType="vertical"
        preventCollision={false}
      >
        {wonhoGridData.map((item) => (
          <div
            key={item.id.toString()}
            data-grid={{
              ...item.layout,
              i: item.id.toString(),
              minW: 2,
              minH: 2,
            }}
            className={`rounded-xl overflow-hidden shadow-sm ${
              editMode ? "ring-2 ring-blue-400 ring-opacity-50" : ""
            }`}
          >
            {React.cloneElement(item.component, {
              registerChart,
              chartKey: item.id.toString(),
            })}
          </div>
        ))}
      </GridLayout>
    </div>
  );
};

export default WonhoGrid;
