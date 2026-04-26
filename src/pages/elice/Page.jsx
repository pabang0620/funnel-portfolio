import { useState } from 'react';
import FifthGrade01 from './FifthGrade01';
import FifthGrade02 from './FifthGrade02';
import FifthGrade04 from './FifthGrade04';
import DemoBadge from '../../components/landingmaker/DemoBadge';
import './style.css';

export default function ElicePortfolio() {
  const [currentPage, setCurrentPage] = useState('grade01');

  const renderPage = () => {
    switch (currentPage) {
      case 'grade01':
        return <FifthGrade01 />;
      case 'grade02':
        return <FifthGrade02 />;
      case 'grade04':
        return <FifthGrade04 />;
      default:
        return <FifthGrade01 />;
    }
  };

  return (
    <div className="elicePortfolio">
      <DemoBadge projectName="Elice" />
      <div className="eliceNav">
        <button
          className={`eliceNavButton ${currentPage === 'grade01' ? 'active' : ''}`}
          onClick={() => setCurrentPage('grade01')}
        >
          덧셈과 뺄셈 (Day 1)
        </button>
        <button
          className={`eliceNavButton ${currentPage === 'grade02' ? 'active' : ''}`}
          onClick={() => setCurrentPage('grade02')}
        >
          나눗셈 (Day 2)
        </button>
        <button
          className={`eliceNavButton ${currentPage === 'grade04' ? 'active' : ''}`}
          onClick={() => setCurrentPage('grade04')}
        >
          약수 찾기 (Day 4)
        </button>
      </div>

      <div className="eliceContent">
        {renderPage()}
      </div>
    </div>
  );
}
