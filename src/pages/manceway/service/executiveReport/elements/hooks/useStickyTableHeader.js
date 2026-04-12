import { useEffect, useRef } from 'react';

/**
 * 테이블 헤더를 스크롤 시 상단에 고정시키는 커스텀 훅
 * thead를 복제하여 fixed position으로 표시
 * @param {any} dependency - 테이블이 변경될 때 재실행하기 위한 의존성 (예: selectedProductId)
 * @param {boolean} enabled - StickyHeader 활성화 여부 (권한이 없을 때 false로 전달)
 */
export function useStickyTableHeader(dependency = null, enabled = true) {
  const cleanupRef = useRef(null);

  useEffect(() => {
    // 비활성화되면 실행하지 않음
    if (!enabled) {
      return;
    }

    // 기존의 모든 sticky-header-clone 제거 (페이지 전환 시 남은 것들 정리)
    const existingClones = document.querySelectorAll('.sticky-header-clone');
    existingClones.forEach(clone => {
      if (clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }
    });

    // 재시도 로직으로 테이블이 렌더링될 때까지 대기
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 300;
    let retryTimer = null;

    const initializeStickyHeaders = () => {
      const layoutMain = document.querySelector('.layout-main');
      if (!layoutMain) {
        return false;
      }

      const tables = document.querySelectorAll('.data-table');

      if (tables.length === 0) {
        // 재시도
        if (retryCount < maxRetries) {
          retryCount++;
          retryTimer = setTimeout(initializeStickyHeaders, retryDelay);
          return false;
        }
        return false;
      }

      // 각 테이블에 대한 복제된 헤더 생성
      const stickyHeaders = [];

      tables.forEach((table, index) => {
        const thead = table.querySelector('thead');
        if (!thead) return;

        // 테이블 컨테이너 찾기 (.data-table-container)
        const tableContainer = table.closest('.data-table-container');

        // 복제된 헤더 컨테이너 생성
        const stickyContainer = document.createElement('div');
        stickyContainer.className = 'sticky-header-clone';
        stickyContainer.style.position = 'fixed';
        stickyContainer.style.top = '4rem';
        stickyContainer.style.left = '0';
        stickyContainer.style.right = '0';
        stickyContainer.style.zIndex = '100';
        stickyContainer.style.display = 'none';
        stickyContainer.style.overflowX = 'auto';
        stickyContainer.style.overflowY = 'hidden';
        // 스크롤바 숨기기
        stickyContainer.style.scrollbarWidth = 'none'; // Firefox
        stickyContainer.style.msOverflowStyle = 'none'; // IE/Edge

        // Webkit 브라우저용 스크롤바 숨기기
        const style = document.createElement('style');
        style.textContent = '.sticky-header-clone::-webkit-scrollbar { display: none; }';
        if (!document.querySelector('style[data-sticky-header-style]')) {
          style.setAttribute('data-sticky-header-style', 'true');
          document.head.appendChild(style);
        }

        // 복제된 테이블 생성
        const clonedTable = document.createElement('table');
        clonedTable.className = table.className;
        clonedTable.style.borderCollapse = 'collapse';
        clonedTable.style.tableLayout = table.style.tableLayout || 'auto';

        // thead 복제
        const clonedThead = thead.cloneNode(true);
        clonedTable.appendChild(clonedThead);

        // 첫 번째 th에 sticky left 적용
        const firstRowCells = clonedThead.querySelectorAll('tr:first-child th');
        if (firstRowCells.length > 0) {
          firstRowCells[0].style.position = 'sticky';
          firstRowCells[0].style.left = '0';
          firstRowCells[0].style.zIndex = '50';
          firstRowCells[0].style.backgroundColor = '#fafafa';
        }

        stickyContainer.appendChild(clonedTable);
        document.body.appendChild(stickyContainer);

        // 가로 스크롤 동기화 이벤트 리스너
        if (tableContainer) {
          const syncHorizontalScroll = () => {
            const scrollLeft = tableContainer.scrollLeft;
            stickyContainer.scrollLeft = scrollLeft;
          };
          tableContainer.addEventListener('scroll', syncHorizontalScroll);

          stickyHeaders.push({
            table,
            container: stickyContainer,
            clonedTable,
            tableContainer,
            syncHorizontalScroll
          });
        } else {
          stickyHeaders.push({
            table,
            container: stickyContainer,
            clonedTable,
            tableContainer: null,
            syncHorizontalScroll: null
          });
        }
      });

      const handleScroll = () => {
        const layoutRect = layoutMain.getBoundingClientRect();
        const layoutTop = layoutRect.top;

        // breadcrumb-nav 높이 계산
        const breadcrumbNav = document.querySelector('.breadcrumb-nav');
        const breadcrumbHeight = breadcrumbNav ? breadcrumbNav.offsetHeight : 0;
        const breadcrumbBottom = breadcrumbNav ? breadcrumbNav.getBoundingClientRect().bottom : layoutTop;

        stickyHeaders.forEach(({ table, container, clonedTable, tableContainer }) => {
          const tableRect = table.getBoundingClientRect();
          const tableTop = tableRect.top;
          const tableBottom = tableRect.bottom;
          const thead = table.querySelector('thead');
          const theadHeight = thead ? thead.offsetHeight : 0;

          // breadcrumb 아래에서 시작
          const stickyTop = Math.max(layoutTop, breadcrumbBottom);

          // 테이블이 sticky 위치를 지나쳤고, 하단은 아직 보이는 경우
          const shouldShow = tableTop < stickyTop && tableBottom > stickyTop + theadHeight;

          if (shouldShow) {
            // 테이블 컨테이너의 위치와 너비 가져오기
            const containerRect = tableContainer ? tableContainer.getBoundingClientRect() : tableRect;

            // 복제된 컨테이너 위치와 크기 설정
            container.style.left = `${containerRect.left}px`;
            container.style.width = `${containerRect.width}px`;
            container.style.top = `${stickyTop}px`;
            container.style.display = 'block';

            // 복제된 테이블 크기 설정 (원본 테이블의 전체 너비)
            clonedTable.style.width = `${table.offsetWidth}px`;

            // 가로 스크롤 동기화 (초기값)
            if (tableContainer) {
              const scrollLeft = tableContainer.scrollLeft;
              container.scrollLeft = scrollLeft;
            }

            // 각 셀의 너비 동기화
            const originalCells = thead.querySelectorAll('th');
            const clonedCells = clonedTable.querySelectorAll('th');
            originalCells.forEach((cell, i) => {
              if (clonedCells[i]) {
                clonedCells[i].style.width = `${cell.offsetWidth}px`;
                clonedCells[i].style.minWidth = `${cell.offsetWidth}px`;
                clonedCells[i].style.maxWidth = `${cell.offsetWidth}px`;
              }
            });
          } else {
            container.style.display = 'none';
          }
        });
      };

      // 이벤트 리스너 등록
      layoutMain.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);

      // 초기 실행
      handleScroll();

      // 클린업 함수를 ref에 저장
      cleanupRef.current = () => {
        layoutMain.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
        stickyHeaders.forEach(({ container, tableContainer, syncHorizontalScroll }) => {
          if (tableContainer && syncHorizontalScroll) {
            tableContainer.removeEventListener('scroll', syncHorizontalScroll);
          }
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        });
      };

      return true; // 초기화 성공
    };

    // 초기 실행
    const timer = setTimeout(() => {
      initializeStickyHeaders();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      // ref에 저장된 클린업 함수 실행
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      // 혹시 남아있는 클론들도 제거
      const remainingClones = document.querySelectorAll('.sticky-header-clone');
      remainingClones.forEach(clone => {
        if (clone.parentNode) {
          clone.parentNode.removeChild(clone);
        }
      });
    };
  }, [dependency, enabled]);
}
