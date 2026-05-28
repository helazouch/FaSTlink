import { Outlet } from 'react-router-dom'
import { LeftSidebar } from '../organisms/LeftSidebar'
import { MobileNavigation } from '../organisms/MobileNavigation'
import { RightSidebar } from '../organisms/RightSidebar'
import { TopNavigation } from '../organisms/TopNavigation'

export const SocialLayout = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_8%_15%,rgba(101,17,239,0.08),transparent_38%),radial-gradient(circle_at_90%_8%,rgba(16,185,129,0.08),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.08),transparent_40%)]" />
    <TopNavigation />

    <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-4 px-4 pb-24 pt-4 lg:grid-cols-[288px,1fr] lg:px-6 lg:pb-8 xl:grid-cols-[288px,1fr,330px]">
      <LeftSidebar />
      <main className="min-h-[calc(100vh-6rem)]">
        <Outlet />
      </main>
      <RightSidebar />
    </div>
    <MobileNavigation />
  </div>
)
