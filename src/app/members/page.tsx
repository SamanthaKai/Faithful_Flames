'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'
import { UserAvatar } from '@/components/UserAvatar'

interface Member {
  id: string
  name: string | null
  image: string | null
  bio: string | null
  createdAt: string
  role: string
  emailVerified: string | null
}

export default function MembersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/members')
      .then((r) => r.json())
      .then((data) => { setMembers(data); setLoading(false) })
  }, [])

  const handleCardClick = (memberId: string) => {
    if (session) {
      router.push(`/members/${memberId}`)
    } else {
      router.push(`/login?callbackUrl=/members/${memberId}`)
    }
  }

  const filtered = members.filter((m) =>
    !search || (m.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0D0A0A]">

      {/* Hero */}
      <div className="page-hero text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-lm-accent dark:text-ember mb-4">
            <Users className="w-3.5 h-3.5" /> Fellowship
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-lm-text dark:text-[#FFF4E8] mb-4">
            Member Directory
          </h1>
          <p className="text-lm-muted dark:text-[#BFAEA3] text-lg leading-relaxed">
            Meet the believers who make up this community. Each face, a story. Each name, a journey.
          </p>
          {!session && (
            <p className="text-sm text-lm-muted dark:text-[#BFAEA3] mt-4">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-lm-accent dark:text-ember underline"
              >
                Sign in
              </button>{' '}
              to view individual profiles.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name…"
            className="input max-w-sm"
          />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="skeleton w-12 h-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-lm-muted dark:text-[#BFAEA3] mx-auto mb-4 opacity-40" />
            <p className="text-lm-muted dark:text-[#BFAEA3]">No members found.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-lm-muted dark:text-[#BFAEA3] mb-4">{filtered.length} {filtered.length === 1 ? 'member' : 'members'}</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((member) => (
                <div
                  key={member.id}
                  onClick={() => handleCardClick(member.id)}
                  className="card p-5 cursor-pointer hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar — stop click so it doesn't trigger card navigation */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <UserAvatar src={member.image} name={member.name} size={48} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-heading font-bold text-lm-text dark:text-[#FFF4E8] group-hover:text-lm-accent dark:group-hover:text-ember transition-colors truncate text-sm">
                          {member.name ?? 'Community Member'}
                        </p>
                        {member.role === 'ADMIN' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-lm-accent/10 dark:bg-ember/10 text-lm-accent dark:text-ember rounded-full flex-shrink-0">
                            Admin
                          </span>
                        )}
                        {!member.emailVerified && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full flex-shrink-0">
                            Unverified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-lm-muted dark:text-[#BFAEA3]">
                        Joined {new Date(member.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                      </p>
                      {member.bio && (
                        <p className="text-xs text-lm-muted dark:text-[#BFAEA3] mt-1.5 line-clamp-2 leading-relaxed">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  {!session && (
                    <p className="text-xs text-lm-accent dark:text-ember mt-3 font-medium">
                      Sign in to view profile →
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
