import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.verse.createMany({
    data: [
      {
        reference: 'Jeremiah 29:11',
        text: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."',
        reflection: 'God has a specific, hope-filled plan for your life. Even in seasons of uncertainty, He is working all things together for your good.',
        tags: ['hope', 'future', 'plans', 'trust'],
        isDaily: true,
      },
      {
        reference: 'Romans 8:28',
        text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
        reflection: 'No situation is outside of God\'s redemptive reach. Every experience — even painful ones — can be woven into something beautiful.',
        tags: ['faith', 'purpose', 'trust', 'goodness'],
      },
      {
        reference: 'Philippians 4:13',
        text: 'I can do all this through him who gives me strength.',
        reflection: 'Our strength is not self-manufactured. Christ is the source of every ability we have to endure and overcome.',
        tags: ['strength', 'perseverance', 'Christ'],
      },
      {
        reference: 'Psalm 23:1',
        text: 'The Lord is my shepherd; I shall not want.',
        reflection: 'When God is your shepherd, you lack nothing that truly matters. He provides, guides, and protects.',
        tags: ['peace', 'provision', 'guidance'],
      },
      {
        reference: 'Isaiah 40:31',
        text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
        reflection: 'Waiting on God is not passive — it is an active trust that positions us to receive supernatural renewal.',
        tags: ['hope', 'strength', 'renewal', 'waiting'],
      },
    ],
    skipDuplicates: true,
  })

  await prisma.article.createMany({
    data: [
      {
        title: 'Why Your Generation Needs Faith More Than Ever',
        content: 'In a world filled with noise, distraction, and uncertainty, the anchor of faith is not a weakness — it is the greatest strength a young person can possess...',
        category: 'Faith & Culture',
        isPublished: true,
      },
      {
        title: 'What It Really Means to Be "On Fire" for God',
        content: 'The phrase "on fire for God" gets thrown around a lot in youth groups and conferences. But what does it actually look like in daily life?...',
        category: 'Discipleship',
        isPublished: true,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.devotion.createMany({
    data: [
      {
        title: 'The Courage to Start Again',
        scripture: 'Lamentations 3:22-23',
        teaching: 'Every morning is a fresh canvas. God\'s mercies are not recycled — they are brand new, poured out specifically for today. No matter what yesterday looked like, this morning you are given a new start.',
        prayerPoint: 'Lord, thank You that Your mercies never fail. Help me to receive Your grace today and walk in the newness You have provided.',
        reflectionQuestion: 'What area of your life do you most need to receive God\'s fresh mercy in today?',
        isPublished: true,
      },
      {
        title: 'Rooted in Love',
        scripture: 'Ephesians 3:17-19',
        teaching: 'Before you can truly love others or yourself, you must first be grounded in the love of God. Paul prays that we would be rooted and established in love — like a tree that cannot be moved by storms.',
        prayerPoint: 'Father, I ask that You would help me understand, at a deeper level, how wide, long, high, and deep Your love is for me.',
        reflectionQuestion: 'In what ways has God\'s love been the foundation of your identity recently?',
        isPublished: true,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.event.createMany({
    data: [
      {
        title: 'Community Prayer Night',
        description: 'Join us online for an hour of worship and intercession together.',
        date: new Date('2026-06-01T19:00:00Z'),
      },
      {
        title: 'Bible Study: Acts 2',
        description: 'We\'re studying the outpouring of the Holy Spirit and what it means for us today.',
        date: new Date('2026-06-08T18:00:00Z'),
      },
      {
        title: 'Testimony Sunday',
        description: 'Share what God has been doing in your life. All are welcome.',
        date: new Date('2026-06-15T11:00:00Z'),
      },
    ],
    skipDuplicates: true,
  })

  console.log('Seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
