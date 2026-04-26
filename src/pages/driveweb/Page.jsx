import React from 'react';
import DriveWeb from './DriveWeb';
import DemoBadge from '../../components/landingmaker/DemoBadge';
import './DriveWeb.css';

export default function DriveWebPage() {
  return (
    <div className="driveWebRoot">
      <DemoBadge projectName="DriveWeb" />
      <DriveWeb />
    </div>
  );
}
