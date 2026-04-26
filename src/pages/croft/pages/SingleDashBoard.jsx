import { useState } from "react";
import WonhoGrid from "../component/utils/DND/WonhoGrid";
import DashSubBar from "../layout/NavBar/SubNavBar/DashSubBar";

const SingleDashBoard = () => {
  const [editMode, setEditMode] = useState(false);
  const [layout, setLayout] = useState([]);

  return (
    <div className="flex flex-col h-full">
      <DashSubBar editMode={editMode} setEditMode={setEditMode} />
      <div className="flex-1 overflow-auto">
        <WonhoGrid
          editMode={editMode}
          layout={layout}
          setLayout={setLayout}
        />
      </div>
    </div>
  );
};

export default SingleDashBoard;
