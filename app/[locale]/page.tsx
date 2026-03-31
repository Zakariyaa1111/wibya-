import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { FeedTabs } from '@/components/feed/FeedTabs'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TopBar />
      <main className="pt-2 pb-20">
        <div className="pt-3">
          <FeedTabs />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}