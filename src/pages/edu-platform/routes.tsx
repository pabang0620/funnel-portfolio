import { Routes, Route, Navigate } from 'react-router-dom'
import './edu-platform-theme.css'
import AdminLayout from './components/layout/AdminLayout'

import Dashboard from './Dashboard'
import Curriculums from './Curriculums'
import CurriculumCreate from './CurriculumCreate'
import CurriculumDetail from './CurriculumDetail'
import LectureCreate from './LectureCreate'
import LectureDetail from './LectureDetail'
import LectureAttendance from './LectureAttendance'
import Students from './Students'
import AdminRoles from './AdminRoles'
import MyAssignments from './MyAssignments'
import MyNotes from './MyNotes'
import Resources from './Resources'
import CurriculumCardDemo from './CurriculumCardDemo'
import ResourcesCardDemo from './ResourcesCardDemo'
import StudentProfileDemo from './StudentProfileDemo'
import RubricDemo from './RubricDemo'
import DashboardDemo from './DashboardDemo'
import StudentsListDemo from './StudentsListDemo'

export default function EduPlatformRoutes() {
  return (
    <div className="edu-platform-app" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="curriculums" element={<Curriculums />} />
          <Route path="curriculums/create" element={<CurriculumCreate />} />
          <Route path="curriculums/:curriculumId" element={<CurriculumDetail />} />
          <Route path="curriculums/:curriculumId/lectures/create" element={<LectureCreate />} />
          <Route path="curriculums/:curriculumId/lectures/:lectureId" element={<LectureDetail />} />
          <Route path="curriculums/:curriculumId/lectures/:lectureId/attendance" element={<LectureAttendance />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:studentId" element={<Students />} />
          <Route path="admin-roles" element={<AdminRoles />} />
          <Route path="resources" element={<Resources />} />
          <Route path="my-assignments" element={<MyAssignments />} />
          <Route path="my-notes" element={<MyNotes />} />
          <Route path="curriculum-card-demo" element={<CurriculumCardDemo />} />
          <Route path="resources-card-demo" element={<ResourcesCardDemo />} />
          <Route path="student-profile-demo" element={<StudentProfileDemo />} />
          <Route path="rubric-demo" element={<RubricDemo />} />
          <Route path="dashboard-demo" element={<DashboardDemo />} />
          <Route path="students-list-demo" element={<StudentsListDemo />} />
        </Route>
      </Routes>
    </div>
  )
}
