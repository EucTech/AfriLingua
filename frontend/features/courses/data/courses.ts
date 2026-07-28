import type { Chapter, Course, CourseLevel, Lesson, LevelTrack, VocabWord } from "@/types/course";

const cefrByLevel: Record<CourseLevel, string> = {
  beginner: "A1",
  intermediate: "B1",
  advanced: "C1",
};

const trackDescriptions: Record<CourseLevel, string> = {
  beginner: "Can understand and use basic expressions",
  intermediate: "Can hold simple conversations on familiar topics",
  advanced: "Can discuss complex ideas fluently and naturally",
};

// Real, freely-licensed Pexels stock clips (self-hosted in /public/videos), one per lesson topic.
const topics = [
  { title: "Say hello", wordIndexes: [0, 1] as [number, number], videoUrl: "/videos/hello.mp4" },
  { title: "Yes and no", wordIndexes: [2, 3] as [number, number], videoUrl: "/videos/yes-no.mp4" },
  { title: "Making friends", wordIndexes: [4, 5] as [number, number], videoUrl: "/videos/friends.mp4" },
  { title: "Food and drink", wordIndexes: [6, 7] as [number, number], videoUrl: "/videos/food.mp4" },
  { title: "At home", wordIndexes: [8, 9] as [number, number], videoUrl: "/videos/home.mp4" },
  { title: "Counting", wordIndexes: [10, 11] as [number, number], videoUrl: "/videos/counting.mp4" },
];

function quizFor(word: VocabWord, pool: VocabWord[], variant: number) {
  const others = pool.filter((w) => w.id !== word.id).map((w) => w.translation);
  const startIndex = pool.findIndex((w) => w.id === word.id);
  const distractors = [1, 2, 3].map((offset) => others[(startIndex + offset + variant) % others.length]);
  const correctIndex = (startIndex + variant) % 4;
  const options = [...distractors];
  options.splice(correctIndex, 0, word.translation);
  return {
    id: `${word.id}-quiz-${variant}`,
    prompt: `What does "${word.word}" mean?`,
    options,
    correctIndex,
  };
}

interface CourseSeed {
  id: string;
  language: string;
  nativeName: string;
  flagEmoji: string;
  description: string;
  level: CourseLevel;
  totalLessons: number;
  words: [string, string][];
}

function makeLesson(
  seed: CourseSeed,
  pool: VocabWord[],
  topic: (typeof topics)[number],
  chapterIndex: number,
  lessonIndex: number,
  cycle: number,
): Lesson {
  const words = topic.wordIndexes.map((idx) => pool[idx]);
  return {
    id: `${seed.id}-c${chapterIndex}-l${lessonIndex}`,
    title: cycle === 0 ? topic.title : `${topic.title} (Review ${cycle})`,
    videoTitle: `${topic.title} in ${seed.language}`,
    videoMinutes: 3 + ((chapterIndex + lessonIndex) % 3),
    videoUrl: topic.videoUrl,
    words,
    quiz: words.map((word) => quizFor(word, pool, cycle)),
  };
}

function buildTrack(seed: CourseSeed): LevelTrack {
  const pool: VocabWord[] = seed.words.map(([word, translation], i) => ({
    id: `${seed.id}-w${i + 1}`,
    word,
    translation,
  }));

  const chapters: Chapter[] = [];
  let lessonCount = 0;
  let chapterIndex = 0;

  const introChapters: { title: string; topicIndexes: number[] }[] = [
    { title: "Greetings & basics", topicIndexes: [0, 1, 2] },
    { title: "Everyday life", topicIndexes: [3, 4, 5] },
  ];

  for (const intro of introChapters) {
    if (lessonCount >= seed.totalLessons) break;
    chapterIndex += 1;
    const lessons: Lesson[] = [];
    for (const topicIndex of intro.topicIndexes) {
      if (lessonCount >= seed.totalLessons) break;
      lessonCount += 1;
      lessons.push(makeLesson(seed, pool, topics[topicIndex], chapterIndex, lessons.length + 1, 0));
    }
    chapters.push({ id: `${seed.id}-c${chapterIndex}`, title: intro.title, lessons });
  }

  let cycle = 1;
  while (lessonCount < seed.totalLessons) {
    chapterIndex += 1;
    const remaining = seed.totalLessons - lessonCount;
    const count = Math.min(topics.length, remaining);
    const lessons = Array.from({ length: count }, (_, i) => {
      lessonCount += 1;
      return makeLesson(seed, pool, topics[i], chapterIndex, i + 1, cycle);
    });
    chapters.push({ id: `${seed.id}-c${chapterIndex}`, title: `Practice & review ${cycle}`, lessons });
    cycle += 1;
  }

  return {
    level: seed.level,
    cefr: cefrByLevel[seed.level],
    description: trackDescriptions[seed.level],
    locked: false,
    chapters,
  };
}

function buildCourse(seed: CourseSeed): Course {
  const levels: CourseLevel[] = ["beginner", "intermediate", "advanced"];
  return {
    id: seed.id,
    language: seed.language,
    nativeName: seed.nativeName,
    flagEmoji: seed.flagEmoji,
    description: seed.description,
    tracks: levels.map((level) =>
      level === seed.level
        ? buildTrack(seed)
        : {
            level,
            cefr: cefrByLevel[level],
            description: trackDescriptions[level],
            locked: true,
            chapters: [],
          },
    ),
  };
}

const seeds: CourseSeed[] = [
  {
    id: "swahili",
    language: "Swahili",
    nativeName: "Kiswahili",
    flagEmoji: "🇰🇪",
    description: "Greetings, numbers, and everyday conversation across East Africa.",
    level: "beginner",
    totalLessons: 40,
    words: [
      ["Jambo", "Hello"],
      ["Asante", "Thank you"],
      ["Ndiyo", "Yes"],
      ["Hapana", "No"],
      ["Rafiki", "Friend"],
      ["Karibu", "Welcome"],
      ["Chakula", "Food"],
      ["Maji", "Water"],
      ["Nyumba", "House"],
      ["Habari", "How's it going"],
      ["Moja", "One"],
      ["Mbili", "Two"],
    ],
  },
  {
    id: "yoruba",
    language: "Yoruba",
    nativeName: "Yorùbá",
    flagEmoji: "🇳🇬",
    description: "Tonal basics, family words, and market phrases from southwestern Nigeria.",
    level: "beginner",
    totalLessons: 36,
    words: [
      ["Ẹ kú àárọ̀", "Good morning"],
      ["Adúpẹ́", "Thank you"],
      ["Bẹ́ẹ̀ni", "Yes"],
      ["Bẹ́ẹ̀kọ́", "No"],
      ["Ọ̀rẹ́", "Friend"],
      ["Ẹ jọ̀wọ́", "Please"],
      ["Oúnjẹ", "Food"],
      ["Omi", "Water"],
      ["Ilé", "House"],
      ["Bawo ni", "How are you"],
      ["Ọ̀kan", "One"],
      ["Èjì", "Two"],
    ],
  },
  {
    id: "amharic",
    language: "Amharic",
    nativeName: "አማርኛ",
    flagEmoji: "🇪🇹",
    description: "Ge'ez script fundamentals and conversational Amharic.",
    level: "intermediate",
    totalLessons: 32,
    words: [
      ["Selam", "Hello"],
      ["Ameseginalehu", "Thank you"],
      ["Ow", "Yes"],
      ["Aydelem", "No"],
      ["Wend", "Friend"],
      ["Dehna", "Fine / well"],
      ["Migib", "Food"],
      ["Wuha", "Water"],
      ["Bét", "House"],
      ["Wetet", "Milk"],
      ["And", "One"],
      ["Hulet", "Two"],
    ],
  },
  {
    id: "zulu",
    language: "Zulu",
    nativeName: "isiZulu",
    flagEmoji: "🇿🇦",
    description: "Click consonants, greetings, and Ubuntu-rooted expressions.",
    level: "beginner",
    totalLessons: 34,
    words: [
      ["Sawubona", "Hello"],
      ["Ngiyabonga", "Thank you"],
      ["Yebo", "Yes"],
      ["Cha", "No"],
      ["Umngane", "Friend"],
      ["Ngicela", "Please"],
      ["Ukudla", "Food"],
      ["Amanzi", "Water"],
      ["Indlu", "House"],
      ["Unjani", "How are you"],
      ["Kunye", "One"],
      ["Kubili", "Two"],
    ],
  },
  {
    id: "hausa",
    language: "Hausa",
    nativeName: "Hausa",
    flagEmoji: "🇳🇬",
    description: "Trade vocabulary and conversation for West Africa's Sahel region.",
    level: "intermediate",
    totalLessons: 30,
    words: [
      ["Sannu", "Hello"],
      ["Na gode", "Thank you"],
      ["Ee", "Yes"],
      ["A'a", "No"],
      ["Aboki", "Friend"],
      ["Don Allah", "Please"],
      ["Abinci", "Food"],
      ["Ruwa", "Water"],
      ["Gida", "House"],
      ["Ina kwana", "Good morning"],
      ["Daya", "One"],
      ["Biyu", "Two"],
    ],
  },
  {
    id: "kinyarwanda",
    language: "Kinyarwanda",
    nativeName: "Ikinyarwanda",
    flagEmoji: "🇷🇼",
    description: "Advanced grammar and storytelling in Rwanda's national language.",
    level: "advanced",
    totalLessons: 28,
    words: [
      ["Muraho", "Hello"],
      ["Murakoze", "Thank you"],
      ["Yego", "Yes"],
      ["Oya", "No"],
      ["Inshuti", "Friend"],
      ["Nyabuneka", "Please"],
      ["Ibiryo", "Food"],
      ["Amazi", "Water"],
      ["Inzu", "House"],
      ["Amakuru", "How's it going"],
      ["Rimwe", "One"],
      ["Kabiri", "Two"],
    ],
  },
];

export const courses: Course[] = seeds.map(buildCourse);
