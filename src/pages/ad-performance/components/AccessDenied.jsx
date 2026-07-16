import Layout from './Layout';
import Breadcrumb from './Breadcrumb';

const AccessDenied = () => (
  <Layout>
    <div className="executive-report-container">
      <Breadcrumb />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ marginBottom: '1rem', color: '#333' }}>접근 권한이 없습니다</h2>
        <p style={{ color: '#666', marginBottom: '0.5rem' }}>
          이 페이지에 접근할 수 있는 권한이 없습니다.
        </p>
        <p style={{ color: '#999', fontSize: '0.9rem' }}>
          관리자에게 권한을 요청해주세요.
        </p>
      </div>
    </div>
  </Layout>
);

export default AccessDenied;
