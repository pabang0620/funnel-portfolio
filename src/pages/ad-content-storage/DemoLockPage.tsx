import DemoLock from '@/components/DemoLock'

interface DemoLockPageProps {
  pageName: string
}

export default function DemoLockPage({ pageName }: DemoLockPageProps) {
  return <DemoLock projectName="Ad Content Storage" pageName={pageName} />
}
