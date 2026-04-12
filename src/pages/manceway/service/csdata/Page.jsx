import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import Layout from '../../components/Layout';
import './CSData.css';
import DataTable from './elements/DataTable';
import MappingTab from './elements/MappingTab';

const CSDataPage = () => {
  const [activeTab, setActiveTab] = useState('data');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Layout>
      <div className="cs-data-container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <div className="breadcrumb-container">
            <ol className="breadcrumb-list">
              <li className="breadcrumb-item">
                <span className="breadcrumb-link">
                  CS 관리
                </span>
                <span className="breadcrumb-separator">
                  <FontAwesomeIcon icon={faAngleRight} />
                </span>
              </li>
              <li className="breadcrumb-item">
                <span className="breadcrumb-link">
                  데이터 관리
                </span>
                <span className="breadcrumb-separator">
                  <FontAwesomeIcon icon={faAngleRight} />
                </span>
              </li>
              <li className="breadcrumb-item">
                <div className="breadcrumb-tabs">
                  <button
                    className={`breadcrumb-tab ${activeTab === 'data' ? 'active' : ''}`}
                    onClick={() => setActiveTab('data')}
                  >
                    데이터 목록
                  </button>
                  <button
                    className={`breadcrumb-tab ${activeTab === 'mapping' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mapping')}
                  >
                    매칭 관리
                  </button>
                </div>
              </li>
            </ol>
          </div>
        </nav>

        {/* Tab Content */}
        {activeTab === 'data' && (
          <div className="data-section">
            <DataTable key={refreshKey} />
          </div>
        )}

        {activeTab === 'mapping' && (
          <div className="mapping-section">
            <MappingTab />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CSDataPage;
