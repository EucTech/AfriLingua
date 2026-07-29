import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, CourseLevel, type User } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const cefrByLevel: Record<CourseLevel, string> = {
  beginner: 'A1',
  intermediate: 'B1',
  advanced: 'C1',
};

const trackDescriptions: Record<CourseLevel, string> = {
  beginner: 'Can understand and use basic expressions',
  intermediate: 'Can hold simple conversations on familiar topics',
  advanced: 'Can discuss complex ideas fluently and naturally',
};

const topics = [
  { title: 'Say hello', wordIndexes: [0, 1] as [number, number], videoUrl: '/videos/hello.mp4' },
  { title: 'Yes and no', wordIndexes: [2, 3] as [number, number], videoUrl: '/videos/yes-no.mp4' },
  { title: 'Making friends', wordIndexes: [4, 5] as [number, number], videoUrl: '/videos/friends.mp4' },
  { title: 'Food and drink', wordIndexes: [6, 7] as [number, number], videoUrl: '/videos/food.mp4' },
  { title: 'At home', wordIndexes: [8, 9] as [number, number], videoUrl: '/videos/home.mp4' },
  { title: 'Counting', wordIndexes: [10, 11] as [number, number], videoUrl: '/videos/counting.mp4' },
];

interface WordSeed {
  word: string;
  translation: string;
}

function quizFor(word: WordSeed, wordIndex: number, pool: WordSeed[], variant: number) {
  const others = pool.filter((_, i) => i !== wordIndex).map((w) => w.translation);
  const distractors = [1, 2, 3].map((offset) => others[(wordIndex + offset + variant) % others.length]);
  const correctIndex = (wordIndex + variant) % 4;
  const options = [...distractors];
  options.splice(correctIndex, 0, word.translation);
  return { prompt: `What does "${word.word}" mean?`, options, correctIndex };
}

interface CourseSeed {
  id: string;
  language: string;
  nativeName: string;
  flagEmoji: string;
  description: string;
  level: CourseLevel;
  totalLessons: number;
  words: WordSeed[];
}

const courseSeeds: CourseSeed[] = [
  {
    id: 'swahili',
    language: 'Swahili',
    nativeName: 'Kiswahili',
    flagEmoji: '🇰🇪',
    description: 'Greetings, numbers, and everyday conversation across East Africa.',
    level: 'beginner',
    totalLessons: 40,
    words: [
      { word: 'Jambo', translation: 'Hello' },
      { word: 'Asante', translation: 'Thank you' },
      { word: 'Ndiyo', translation: 'Yes' },
      { word: 'Hapana', translation: 'No' },
      { word: 'Rafiki', translation: 'Friend' },
      { word: 'Karibu', translation: 'Welcome' },
      { word: 'Chakula', translation: 'Food' },
      { word: 'Maji', translation: 'Water' },
      { word: 'Nyumba', translation: 'House' },
      { word: 'Habari', translation: "How's it going" },
      { word: 'Moja', translation: 'One' },
      { word: 'Mbili', translation: 'Two' },
    ],
  },
  {
    id: 'yoruba',
    language: 'Yoruba',
    nativeName: 'Yorùbá',
    flagEmoji: '🇳🇬',
    description: 'Tonal basics, family words, and market phrases from southwestern Nigeria.',
    level: 'beginner',
    totalLessons: 36,
    words: [
      { word: 'Ẹ kú àárọ̀', translation: 'Good morning' },
      { word: 'Adúpẹ́', translation: 'Thank you' },
      { word: 'Bẹ́ẹ̀ni', translation: 'Yes' },
      { word: 'Bẹ́ẹ̀kọ́', translation: 'No' },
      { word: 'Ọ̀rẹ́', translation: 'Friend' },
      { word: 'Ẹ jọ̀wọ́', translation: 'Please' },
      { word: 'Oúnjẹ', translation: 'Food' },
      { word: 'Omi', translation: 'Water' },
      { word: 'Ilé', translation: 'House' },
      { word: 'Bawo ni', translation: 'How are you' },
      { word: 'Ọ̀kan', translation: 'One' },
      { word: 'Èjì', translation: 'Two' },
    ],
  },
  {
    id: 'amharic',
    language: 'Amharic',
    nativeName: 'አማርኛ',
    flagEmoji: '🇪🇹',
    description: "Ge'ez script fundamentals and conversational Amharic.",
    level: 'intermediate',
    totalLessons: 32,
    words: [
      { word: 'Selam', translation: 'Hello' },
      { word: 'Ameseginalehu', translation: 'Thank you' },
      { word: 'Ow', translation: 'Yes' },
      { word: 'Aydelem', translation: 'No' },
      { word: 'Wend', translation: 'Friend' },
      { word: 'Dehna', translation: 'Fine / well' },
      { word: 'Migib', translation: 'Food' },
      { word: 'Wuha', translation: 'Water' },
      { word: 'Bét', translation: 'House' },
      { word: 'Wetet', translation: 'Milk' },
      { word: 'And', translation: 'One' },
      { word: 'Hulet', translation: 'Two' },
    ],
  },
  {
    id: 'zulu',
    language: 'Zulu',
    nativeName: 'isiZulu',
    flagEmoji: '🇿🇦',
    description: 'Click consonants, greetings, and Ubuntu-rooted expressions.',
    level: 'beginner',
    totalLessons: 34,
    words: [
      { word: 'Sawubona', translation: 'Hello' },
      { word: 'Ngiyabonga', translation: 'Thank you' },
      { word: 'Yebo', translation: 'Yes' },
      { word: 'Cha', translation: 'No' },
      { word: 'Umngane', translation: 'Friend' },
      { word: 'Ngicela', translation: 'Please' },
      { word: 'Ukudla', translation: 'Food' },
      { word: 'Amanzi', translation: 'Water' },
      { word: 'Indlu', translation: 'House' },
      { word: 'Unjani', translation: 'How are you' },
      { word: 'Kunye', translation: 'One' },
      { word: 'Kubili', translation: 'Two' },
    ],
  },
  {
    id: 'hausa',
    language: 'Hausa',
    nativeName: 'Hausa',
    flagEmoji: '🇳🇬',
    description: "Trade vocabulary and conversation for West Africa's Sahel region.",
    level: 'intermediate',
    totalLessons: 30,
    words: [
      { word: 'Sannu', translation: 'Hello' },
      { word: 'Na gode', translation: 'Thank you' },
      { word: 'Ee', translation: 'Yes' },
      { word: "A'a", translation: 'No' },
      { word: 'Aboki', translation: 'Friend' },
      { word: 'Don Allah', translation: 'Please' },
      { word: 'Abinci', translation: 'Food' },
      { word: 'Ruwa', translation: 'Water' },
      { word: 'Gida', translation: 'House' },
      { word: 'Ina kwana', translation: 'Good morning' },
      { word: 'Daya', translation: 'One' },
      { word: 'Biyu', translation: 'Two' },
    ],
  },
  {
    id: 'kinyarwanda',
    language: 'Kinyarwanda',
    nativeName: 'Ikinyarwanda',
    flagEmoji: '🇷🇼',
    description: "Advanced grammar and storytelling in Rwanda's national language.",
    level: 'advanced',
    totalLessons: 28,
    words: [
      { word: 'Muraho', translation: 'Hello' },
      { word: 'Murakoze', translation: 'Thank you' },
      { word: 'Yego', translation: 'Yes' },
      { word: 'Oya', translation: 'No' },
      { word: 'Inshuti', translation: 'Friend' },
      { word: 'Nyabuneka', translation: 'Please' },
      { word: 'Ibiryo', translation: 'Food' },
      { word: 'Amazi', translation: 'Water' },
      { word: 'Inzu', translation: 'House' },
      { word: 'Amakuru', translation: "How's it going" },
      { word: 'Rimwe', translation: 'One' },
      { word: 'Kabiri', translation: 'Two' },
    ],
  },
];

const seedCompletedCounts: Record<string, number> = {
  swahili: 24,
  yoruba: 9,
  amharic: 0,
  zulu: 34,
  hausa: 5,
  kinyarwanda: 0,
};

async function seedCourse(seed: CourseSeed) {
  const levels: CourseLevel[] = ['beginner', 'intermediate', 'advanced'];
  const course = await prisma.course.create({
    data: {
      id: seed.id,
      language: seed.language,
      nativeName: seed.nativeName,
      flagEmoji: seed.flagEmoji,
      description: seed.description,
    },
  });

  const lessonPlans: { chapterTitle: string; lessonTitle: string; topicIndex: number; cycle: number }[] = [];
  const introChapters = [
    { title: 'Greetings & basics', topicIndexes: [0, 1, 2] },
    { title: 'Everyday life', topicIndexes: [3, 4, 5] },
  ];
  let lessonCount = 0;
  for (const intro of introChapters) {
    for (const topicIndex of intro.topicIndexes) {
      if (lessonCount >= seed.totalLessons) break;
      lessonPlans.push({ chapterTitle: intro.title, lessonTitle: topics[topicIndex].title, topicIndex, cycle: 0 });
      lessonCount++;
    }
  }
  let cycle = 1;
  while (lessonCount < seed.totalLessons) {
    const remaining = seed.totalLessons - lessonCount;
    const count = Math.min(topics.length, remaining);
    for (let i = 0; i < count; i++) {
      lessonPlans.push({
        chapterTitle: `Practice & review ${cycle}`,
        lessonTitle: `${topics[i].title} (Review ${cycle})`,
        topicIndex: i,
        cycle,
      });
      lessonCount++;
    }
    cycle++;
  }

  let completedSoFar = 0;
  const targetCompleted = seedCompletedCounts[seed.id] ?? 0;
  const trackLessonIds: string[] = [];

  for (const level of levels) {
    const locked = level !== seed.level;
    const track = await prisma.levelTrack.create({
      data: {
        courseId: course.id,
        level,
        cefr: cefrByLevel[level],
        description: trackDescriptions[level],
        locked,
      },
    });

    if (locked) continue;

    let chapterOrder = 0;
    let currentChapterTitle: string | null = null;
    let currentChapterId: string | null = null;
    let lessonOrderInChapter = 0;

    for (const plan of lessonPlans) {
      if (plan.chapterTitle !== currentChapterTitle) {
        currentChapterTitle = plan.chapterTitle;
        chapterOrder++;
        lessonOrderInChapter = 0;
        const chapter = await prisma.chapter.create({
          data: { trackId: track.id, title: plan.chapterTitle, order: chapterOrder },
        });
        currentChapterId = chapter.id;
      }
      lessonOrderInChapter++;

      const topic = topics[plan.topicIndex];
      const words = topic.wordIndexes.map((idx) => seed.words[idx]);

      const lesson = await prisma.lesson.create({
        data: {
          chapterId: currentChapterId!,
          title: plan.lessonTitle,
          videoTitle: `${topic.title} in ${seed.language}`,
          videoMinutes: 3 + (lessonOrderInChapter % 3),
          videoUrl: topic.videoUrl,
          order: lessonOrderInChapter,
          words: {
            create: words.map((w, i) => ({ word: w.word, translation: w.translation, order: i })),
          },
        },
      });

      for (let i = 0; i < topic.wordIndexes.length; i++) {
        const wordIdx = topic.wordIndexes[i];
        const q = quizFor(seed.words[wordIdx], wordIdx, seed.words, plan.cycle);
        await prisma.quizQuestion.create({
          data: { lessonId: lesson.id, prompt: q.prompt, options: q.options, correctIndex: q.correctIndex, order: i },
        });
      }

      trackLessonIds.push(lesson.id);
    }
  }

  return { courseId: course.id, trackLessonIds, targetCompleted };
}

async function main() {
  console.log('Seeding courses...');
  const courseResults: { courseId: string; trackLessonIds: string[]; targetCompleted: number }[] = [];
  for (const seed of courseSeeds) {
    courseResults.push(await seedCourse(seed));
  }

  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const guest = await prisma.user.create({
    data: {
      name: 'Guest User',
      email: 'guest@afrilingua.app',
      passwordHash,
      xp: 2110,
      streakDays: 12,
      languageProfile: {
        create: {
          spokenLanguages: ['English'],
          targetLanguages: ['Swahili'],
          proficiency: 'beginner',
          goals: ['Travel', 'Culture'],
          availability: ['Evenings'],
        },
      },
      notificationPreferences: { create: {} },
      accessibilityPreferences: { create: {} },
    },
  });

  const partnerSeeds = [
    { name: 'Amara Diallo', country: 'Senegal', xp: 2840, streakDays: 41, speaks: ['Yoruba', 'English'], learning: ['French'], proficiency: 'advanced' as CourseLevel, availability: ['Evenings'] },
    { name: 'Kwame Mensah', country: 'Ghana', xp: 2615, streakDays: 33, speaks: ['Hausa'], learning: ['Swahili'], proficiency: 'intermediate' as CourseLevel, availability: ['Mornings'] },
    { name: 'Naledi Khumalo', country: 'South Africa', xp: 2390, streakDays: 27, speaks: ['Zulu', 'English'], learning: ['Portuguese'], proficiency: 'advanced' as CourseLevel, availability: ['Evenings'] },
    { name: 'Fatima Bello', country: 'Senegal', xp: 1980, streakDays: 19, speaks: ['Yoruba', 'French'], learning: ['English'], proficiency: 'intermediate' as CourseLevel, availability: ['Weekends'] },
    { name: 'Tendai Moyo', country: 'Zimbabwe', xp: 1725, streakDays: 8, speaks: ['Zulu'], learning: ['Swahili'], proficiency: 'beginner' as CourseLevel, availability: ['Mornings', 'Weekends'] },
    { name: 'Chidi Okafor', country: 'Nigeria', xp: 1502, streakDays: 15, speaks: ['Hausa', 'English'], learning: ['Amharic'], proficiency: 'intermediate' as CourseLevel, availability: ['Evenings'] },
    { name: 'Amina Yusuf', country: 'Kenya', xp: 1340, streakDays: 6, speaks: ['Swahili'], learning: ['English'], proficiency: 'beginner' as CourseLevel, availability: ['Evenings', 'Weekends'] },
    { name: 'Tunde Bakare', country: 'Nigeria', xp: 1210, streakDays: 4, speaks: ['Yoruba', 'English'], learning: ['Swahili'], proficiency: 'intermediate' as CourseLevel, availability: ['Mornings'] },
    { name: 'Selam Girma', country: 'Ethiopia', xp: 980, streakDays: 3, speaks: ['Amharic'], learning: ['French'], proficiency: 'beginner' as CourseLevel, availability: ['Weekends'] },
    { name: 'Thandiwe Nkosi', country: 'South Africa', xp: 875, streakDays: 2, speaks: ['Zulu', 'English'], learning: ['Portuguese'], proficiency: 'advanced' as CourseLevel, availability: ['Evenings'] },
    { name: 'Ibrahim Sani', country: 'Nigeria', xp: 640, streakDays: 1, speaks: ['Hausa'], learning: ['Arabic'], proficiency: 'intermediate' as CourseLevel, availability: ['Mornings', 'Weekends'] },
    { name: 'Claudine Uwase', country: 'Rwanda', xp: 420, streakDays: 1, speaks: ['Kinyarwanda', 'French'], learning: ['English'], proficiency: 'advanced' as CourseLevel, availability: ['Evenings'] },
  ];

  const partners: User[] = [];
  for (const p of partnerSeeds) {
    const user = await prisma.user.create({
      data: {
        name: p.name,
        email: `${p.name.toLowerCase().replace(/\s+/g, '.')}@afrilingua.app`,
        passwordHash,
        country: p.country,
        xp: p.xp,
        streakDays: p.streakDays,
        languageProfile: {
          create: {
            spokenLanguages: p.speaks,
            targetLanguages: p.learning,
            proficiency: p.proficiency,
            goals: [],
            availability: p.availability,
          },
        },
        notificationPreferences: { create: {} },
        accessibilityPreferences: { create: {} },
      },
    });
    partners.push(user);
  }

  console.log('Seeding lesson progress...');
  for (const result of courseResults) {
    const toComplete = result.trackLessonIds.slice(0, result.targetCompleted);
    for (const lessonId of toComplete) {
      await prisma.lessonProgress.create({ data: { userId: guest.id, lessonId } });
    }
  }

  console.log('Seeding notifications...');
  await prisma.notification.createMany({
    data: [
      { userId: guest.id, type: 'message', title: 'New message from Amara', body: 'Great, so "Ẹ káàrọ̀" is good morning...', read: false },
      { userId: guest.id, type: 'match', title: 'New tandem request', body: 'Kwame Mensah wants to practice with you', read: false },
      { userId: guest.id, type: 'reminder', title: 'Keep your streak alive', body: "You haven't practiced today yet", read: true },
    ],
  });

  console.log('Seeding chat conversation...');
  const amara = partners.find((p) => p.name === 'Amara Diallo')!;
  const conversation = await prisma.conversation.create({
    data: { participants: { create: [{ userId: guest.id }, { userId: amara.id }] } },
  });
  await prisma.chatMessage.createMany({
    data: [
      { conversationId: conversation.id, senderId: amara.id, text: "Ẹ káàrọ̀! Ready for today's session?" },
      { conversationId: conversation.id, senderId: guest.id, text: "Good morning! Yes, let's go over greetings again" },
      { conversationId: conversation.id, senderId: amara.id, text: 'Great, so "Ẹ káàrọ̀" is good morning. Try it back?' },
    ],
  });

  console.log('Seed complete.');
  console.log(`Guest login: ${guest.email} / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
