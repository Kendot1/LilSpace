export interface JourneyChapter {
  id: string
  range: readonly [number, number]
  label: string
  location: string
  title: string
  body: string
}

// All visible journey messages live here. Replace the suggested closing message freely.
export const journeyChapters: readonly JourneyChapter[] = [
  { id: 'origin', range: [0, .2], label: 'Manila', location: 'Metro Manila, Philippines', title: 'From where I am…', body: 'A little journey to where you are.' },
  { id: 'north', range: [.2, .45], label: 'Northbound', location: 'The journey north', title: 'Every mile brings me closer.', body: 'Leaving the city behind, following the changing horizon.' },
  { id: 'baguio', range: [.45, .65], label: 'Baguio', location: 'Baguio, Philippines', title: 'Where you chase your dreams.', body: 'A little closer to the world you’re building. Baguio is where you study nursing.' },
  { id: 'union', range: [.65, .85], label: 'La Union', location: 'La Union, Philippines', title: 'And finally, closer to you.', body: 'From mountain air to the warmth of the coast. La Union is where you are now.' },
  { id: 'flowers', range: [.85, 1], label: 'For you', location: 'A little something for you', title: 'These are for you.', body: 'Until I can give you flowers in person, I made these for you.' },
]

export function chapterIndexAt(progress: number): number {
  const index = journeyChapters.findIndex(chapter => progress < chapter.range[1])
  return index < 0 ? journeyChapters.length - 1 : index
}

export function smoothRange(value: number, start: number, end: number): number {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)))
  return t * t * (3 - 2 * t)
}

export function chapterOpacity(progress: number, index: number): number {
  const chapter = journeyChapters[index]
  const fadeIn = index === 0 ? 1 : smoothRange(progress, chapter.range[0] - .025, chapter.range[0] + .025)
  const fadeOut = index === journeyChapters.length - 1 ? 1 : 1 - smoothRange(progress, chapter.range[1] - .025, chapter.range[1] + .025)
  return fadeIn * fadeOut
}
