'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserAvatar } from '@/components/UserAvatar'
import { FORUM_TOPIC_MAP } from '@/lib/forum-topics'

interface MemberPost {
  id: string
  title: string
  content: string
  topic: string
  createdAt: string
  _count: { replies: number }
}

interface MemberProfile {
  id: string
  name: string | null
  image: string | null
  bio: string | null
  createdAt: string
  role: string
  emailVerified: string | null
  posts: MemberPost[]
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [member, setMember] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/members/${id}`)
      return
    }
    if (status === 'authenticated') {
      fetch(`/api/members/${id}`)
        .then((r) => {
          if (!r.ok) { setNotFound(true); setLoading(false); return null }
          return r.json()
        })
        .then((data) => {
          if (data) { setMember(data); setLoading(false) }
        })
    }
  }, [status, id, router])

  if (status === 'loading' || (loading && !notFound)) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="card p-8">
          <div className="flex items-start gap-5 mb-6">
            <div className="skeleton w-16 h-16 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="skeleton h-6 w-48 rounded" />
              <div className="skeleton h-4 w-32 rounded" />
            </div>
          </div>
          <div className="skeleton h-4 w-full rounded mb-2" />
          <div className="skeleton h-4 w-3/4 rounded" />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="text-center py-24">
        <p className="text-lm-muted dark:text-[#BFAEA3] mb-4">Member not found.</p>
        <Link href="/members" className="text-lm-accent dark:text-ember hover:underline">
          ← Back to Members
        </Link>
      </div>
    )
  }

  if (!member) return null

  const memberSince = new Date(member.createdAt).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
  const isOwnProfile = session?.user?.id === member.id

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <Link
        href="/members"
        className="text-sm text-lm-muted dark:text-[#BFAEA3] hover:text-lm-accent dark:hover:text-ember transition-colors mb-6 inline-flex items-center gap-1"
      >
        ← Back to Members
      </Link>

      {/* Profile card */}
      <div className="card p-6 md:p-8 mb-6">
        <div className="flex items-start gap-5">
          <UserAvatar src={member.image} name={member.name} size={64} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-heading text-2xl font-bold text-lm-text dark:text-[#FFF4E8]">
                {member.name ?? 'Community Member'}
              </h1>
              {member.role === 'ADMIN' && (
                <span className="px-2 py-0.5 bg-lm-accent/10 dark:bg-ember/10 text-lm-accent dark:text-ember text-xs font-semibold rounded-full">
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm text-lm-muted dark:text-[#BFAEA3]">Member since {memberSince}</p>
            {isOwnProfile && (
              <Link
                href="/profile"
                className="text-xs text-lm-accent dark:text-ember hover:underline mt-1 block"
              >
                Edit your profile →
              </Link>
            )}
          </div>
        </div>

        {member.bio && (
          <div className="mt-6 pt-5 border-t border-lm-border dark:border-ember/10">
            <p className="text-xs font-semibold text-lm-muted dark:text-[#BFAEA3] uppercase tracking-wide mb-2">
              About
            </p>
            <p className="text-lm-text dark:text-[#FFF4E8] text-sm leading-relaxed">{member.bio}</p>
          </div>
        )}
      </div>

      {/* Posts */}
      <h2 className="font-heading text-xl font-bold text-lm-text dark:text-[#FFF4E8] mb-4">
        Recent Posts
        <span className="text-sm font-normal text-lm-muted dark:text-[#BFAEA3] ml-2">
          ({member.posts.length})
        </span>
      </h2>

      {member.posts.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-lm-muted dark:text-[#BFAEA3] text-sm">No posts yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {member.posts.map((post) => {
            const meta = FORUM_TOPIC_MAP[post.topic]
            return (
              <Link key={post.id} href={`/forum/${post.id}`} className="block group">
                <article className="card p-4 border-l-4 border-l-lm-accent dark:border-l-ember">
                  {meta && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block border ${meta.light} dark:${meta.dark}`}>
                      {meta.label}
                    </span>
                  )}
                  <h3 className="font-heading font-bold text-lm-text dark:text-[#FFF4E8] text-sm group-hover:text-lm-accent dark:group-hover:text-ember transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-lm-muted dark:text-[#BFAEA3] text-xs mt-1 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-lm-muted dark:text-[#BFAEA3]">
                    <span>{timeAgo(post.createdAt)}</span>
                    <span>{post._count.replies} {post._count.replies === 1 ? 'reply' : 'replies'}</span>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
