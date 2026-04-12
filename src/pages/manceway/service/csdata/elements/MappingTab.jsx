import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faArrowRight, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { getMappings, deleteMapping, createMapping, getProducts } from '../api';

const MappingTab = () => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMapping, setNewMapping] = useState({ csProductName: '', productId: '', productName: '' });
  const [products, setProducts] = useState([]);
  const [addLoading, setAddLoading] = useState(false);

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const result = await getMappings(search);
      if (result.success) {
        setMappings(result.data);
      }
    } catch (err) {
      console.error('매핑 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const result = await getProducts();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (err) {
      console.error('제품 목록 조회 실패:', err);
    }
  };

  const handleAddMapping = async () => {
    if (!newMapping.csProductName || !newMapping.productId) {
      alert('CS 상품명과 제품을 모두 입력해주세요.');
      return;
    }

    setAddLoading(true);
    try {
      const result = await createMapping({
        csProductName: newMapping.csProductName,
        productId: parseInt(newMapping.productId),
        productName: newMapping.productName
      });

      if (result.success) {
        setShowAddForm(false);
        setNewMapping({ csProductName: '', productId: '', productName: '' });
        fetchMappings();
      } else {
        alert(result.msg || '매핑 추가 실패');
      }
    } catch (err) {
      alert('매핑 추가 중 오류가 발생했습니다.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewMapping({ csProductName: '', productId: '', productName: '' });
  };

  const handleSearch = () => {
    fetchMappings();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 매핑을 삭제하시겠습니까?')) return;

    try {
      const result = await deleteMapping(id);
      if (result.success) {
        fetchMappings();
      } else {
        alert(result.msg);
      }
    } catch (err) {
      alert('삭제 실패');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ko-KR');
  };

  return (
    <>
      {/* Search Section */}
      <div className="mapping-header">
        <div className="search-box mapping-search">
          <input
            type="text"
            className="search-input"
            placeholder="CS 상품명 또는 제품명 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            style={{ width: '280px' }}
          />
          <button className="search-btn" onClick={handleSearch}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        <button className="add-mapping-btn" onClick={() => setShowAddForm(!showAddForm)}>
          <FontAwesomeIcon icon={faPlus} />
          매핑 추가
        </button>
      </div>

      {/* Add Mapping Form */}
      {showAddForm && (
        <div className="add-mapping-form">
          <input
            type="text"
            placeholder="CS 상품명 입력"
            value={newMapping.csProductName}
            onChange={e => setNewMapping({...newMapping, csProductName: e.target.value})}
          />
          <select
            value={newMapping.productId}
            onChange={e => {
              const product = products.find(p => p.id === parseInt(e.target.value));
              setNewMapping({
                ...newMapping,
                productId: e.target.value,
                productName: product?.name || ''
              });
            }}
          >
            <option value="">제품 선택</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button className="btn-add" onClick={handleAddMapping} disabled={addLoading}>
            {addLoading ? '추가 중...' : '추가'}
          </button>
          <button className="btn-cancel-form" onClick={handleCancelAdd}>
            취소
          </button>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table className="mapping-table">
          <thead>
            <tr>
              <th>CS 상품명</th>
              <th className="mapping-arrow"></th>
              <th>제품명</th>
              <th>등록일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row">
                <td colSpan="5">로딩 중...</td>
              </tr>
            ) : mappings.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="5">등록된 매핑이 없습니다.</td>
              </tr>
            ) : (
              mappings.map(item => (
                <tr key={item.id}>
                  <td>{item.csProductName}</td>
                  <td className="mapping-arrow">
                    <FontAwesomeIcon icon={faArrowRight} />
                  </td>
                  <td>{item.productName}</td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(item.id)}
                      title="삭제"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info Text */}
      <div className="info-text">
        <p>* 매핑은 엑셀 업로드 시 자동으로 적용됩니다.</p>
        <p>* 매핑을 삭제하면 다음 업로드 시 수동 매칭이 필요합니다.</p>
      </div>
    </>
  );
};

export default MappingTab;
