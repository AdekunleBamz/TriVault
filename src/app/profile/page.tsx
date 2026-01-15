import { ProfileView } from '@/components/ProfileView'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata = {
  title: 'Profile | TriVault',
  description: 'View your TriVault profile and seal collection progress.',
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-8 text-center w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          👤 Your Profile
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          View your seal collection and achievement progress.
        </p>
      </section>

      {/* Profile Content */}
      <main className="max-w-4xl mx-auto px-4 pb-16 w-full flex-1">
        <ProfileView />
      </main>

      <Footer />
    </div>
  )
}
