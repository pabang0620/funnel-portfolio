import { Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface DemoLockProps {
  projectName: string
  pageName: string
}

export default function DemoLock({ projectName, pageName }: DemoLockProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-full p-5">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
          {projectName} · {pageName}
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          This page isn't available in the demo version
        </h2>

        <p className="text-sm text-gray-500 mb-8">
          It works normally in the real service
        </p>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Go back
        </button>
      </div>
    </div>
  )
}
