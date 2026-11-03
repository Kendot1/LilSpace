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
  portrait: string
  portraitAlt: string
  about: string
  interests: string[]
  dreams: string[]
  favoriteThings: string[]
  favoriteColors: string[]
  favoriteFlowers: string[]
  journey: string
  reminders: Reminder[]
  gallery: GalleryPhoto[]
  memories: Memory[]
}

export const personal: PersonalContent = {
  name: '', // ADD NAME OR NICKNAME
  occasion: '',
  greeting: 'There’s a little space for you here.',
  message: '', // ADD YOUR PERSONAL LETTER. The UI labels its fallback as an example.
  signature: '', // e.g. your name
  portrait: '',
  portraitAlt: '',
  about: '',
  interests: [] as string[],
  dreams: [] as string[],
  favoriteThings: [],
  favoriteColors: [], // Optional preferences, not assumptions about her.
  favoriteFlowers: [],
  journey: 'From La Union’s coast to the mountains of Baguio. A nursing student, with a whole world beyond the classroom.',
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
