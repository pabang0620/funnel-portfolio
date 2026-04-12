import { Routes, Route } from 'react-router-dom';
import { CalendarView } from './pages/CalendarView';
import { AdminPage } from './pages/admin/AdminPage';
import { MobileCalendarView } from './pages/mobile/MobileCalendarView';
import { MobileReservationList } from './pages/mobile/MobileReservationList';
import './meeting-room-theme.css';

export default function MeetingRoomRoutes() {
  return (
    <div className="meeting-room-app" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        <Route index element={<CalendarView />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="mobile" element={<MobileCalendarView />} />
        <Route path="mobile/list" element={<MobileReservationList />} />
      </Routes>
    </div>
  );
}
