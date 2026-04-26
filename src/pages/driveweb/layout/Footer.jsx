import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <div>
        <h2>DriveWeb</h2>
        <ul className="helpArea">
          <li>
            <span>이메일</span>contact@driveweb.demo
          </li>
        </ul>
        <ul className="companyArea">
          <li>운행일지 관리 시스템</li>
          <li>포트폴리오 데모 버전</li>
        </ul>
        <p className="copyline">&copy; 2025 DriveWeb Portfolio Demo</p>
      </div>
    </footer>
  );
}

export default Footer;
