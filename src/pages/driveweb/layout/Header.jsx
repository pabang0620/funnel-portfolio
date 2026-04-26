import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <div className="headerInner">
        <div className="headerOne">
          <h1>
            <Link to="/portfolio/driveweb/drive">DriveWeb</Link>
          </h1>
        </div>
        <nav>
          <ul className="mainmenu">
            <li className="selected">
              <Link to="/portfolio/driveweb/drive">운행일지</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
