import type { Memory } from '../lib/storage'

// Your one personalization file. Empty fields are intentionally not invented.
// Photos should be local paths in public/photos, e.g. /photos/portrait.webp.
export interface Reminder { title: string; text: string; category: string }
export interface GalleryPhoto { src: string; alt: string; caption: string }
export interface PersonalContent {
  name: string
  occasion: string
  greeting: string
  message: string
  signature: string
  surpriseMessage: string
  senderLocation: string
  connectionLetter: string
  currentLocation: string
  studyLocation: string
  fieldOfStudy: string
  portrait: string
  portraitAlt: string
  about: string
  interests: string[]
  dreams: string[]
  favoriteThings: string[]
  favoriteColors: string[]
  favoriteFlowers: string[]
  journey: string
  story: { title: string; text: string }[]
  reminders: Reminder[]
  gallery: GalleryPhoto[]
  memories: Memory[]
}

export const personal: PersonalContent = {
  name: '', // ADD NAME OR NICKNAME
  occasion: '',
  greeting: 'There’s a little space for you here.',
  message: '', // ADD YOUR PERSONAL LETTER. Missing content stays an honest empty state.
  signature: '', // e.g. your name
  surpriseMessage: '', // Optional separate gift message
  senderLocation: '',
  // Written from the love you expressed; replace freely with your own voice.
  connectionLetter: 'I made this little world because I love you, and I want you to feel it. Not just in a big moment, but in the quiet ones too. You are special to me—not because of what you achieve, or how much you can carry, but because you are you. If I could place one thing in your hands from here, it would be the certainty that you are loved. Until I can tell you beside you, let this little space say it for me: I love you. This is for you.',
  currentLocation: 'La Union',
  studyLocation: 'Baguio',
  fieldOfStudy: 'Nursing',
  portrait: '',
  portraitAlt: '',
  about: '',
  interests: [] as string[],
  dreams: [] as string[],
  favoriteThings: [],
  favoriteColors: [], // Optional preferences, not assumptions about her.
  favoriteFlowers: [],
  journey: 'From La Union’s coast to the mountains of Baguio. A nursing student, with a whole world beyond the classroom.',
  // An imagined invitation, not a claim about her experiences. Edit every passage here.
  story: [
    { title: 'Two places. One us.', text: 'La Union is where you are now; Baguio is where you study. Different landscapes, and a little world made to hold a thought of you.' },
    { title: 'This is me, reaching for you.', text: 'From my side of this little world, I send something simple: my love. Not a grand performance. Just something I want you to feel.' },
    { title: 'And there you are.', text: 'Among the pines is a small figure for you. Not your whole story, not a portrait—just a way to show who this is all for.' },
    { title: 'You are not just far away.', text: 'You are someone I love. Someone worth the time, the thought, and every small detail I put into this place.' },
    { title: 'A little light between us.', text: 'Two places do not have to become one for a small reminder to travel between them: you are loved.' },
    { title: 'I want you to feel loved.', text: 'Not only when everything is going well. Not only when there is something to celebrate. You do not have to earn a place in my heart.' },
    { title: 'Closer, one little step.', text: 'Here, the distance softens. Two paths begin to meet. An imagined moment, made from something real: the love I have for you.' },
    { title: 'A place beside me.', text: 'This garden is not a memory I am pretending we have. It is a little picture of what I want this gift to feel like: warmth, closeness, and room for the two of us.' },
    { title: 'This was always for you.', text: 'The coast, the mountain air, the light, every little turn of the story. I made them to say something I never want you to doubt: I love you.' },
  ],
  reminders: [
    { title: 'You don’t have to do it all today.', text: 'One small step is still a step. There is room to begin again tomorrow.', category: 'For busy days' },
    { title: 'Rest is not something you need to earn.', text: 'Put down what you can for a moment. A pause belongs in your day, too.', category: 'A softer pace' },
    { title: 'A little care for you, too.', text: 'A sip of water, something to eat, a gentle stretch. Start with what you need.', category: 'Everyday care' },
    { title: 'You are more than your to-do list.', text: 'There is so much to you beyond what you finish, study, or get right.', category: 'Just because' },
    { title: 'Learning takes time.', text: 'You are allowed to ask questions and take things one lesson at a time.', category: 'Study days' },
  ],
  gallery: [] as { src: string; alt: string; caption: string }[], // local photos, e.g. {src:'/photos/coast.webp',alt:'Describe the real photo',caption:'Your caption'}
  memories: [] as Memory[], // { id: 'unique-id', title: '...', date: 'YYYY-MM-DD', story: '...', photo?: '/photos/....webp' }
}
export const exampleLetter = 'If today has been a lot, you can put it down for a moment. I hope this little space reminds you that you deserve gentleness, laughter, and time for the things you love. There’s no big occasion needed to tell you: I’m glad you’re here.'
