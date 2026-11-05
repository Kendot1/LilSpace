import { useCallback, useEffect, useRef, useState } from 'react'

export interface ScrollStageState {
  currentStage: number
  progress: number
  isTransitioning: boolean
}

interface UseScrollStagesOptions {
  stageCount: number
  scrollSensitivity?: number
  momentumDamping?: number
  onStageChange?: (stage: number) => void
}

export function useScrollStages({ stageCount, onStageChange }: UseScrollStagesOptions) {
  const [state, setState] = useState<ScrollStageState>({ currentStage: 0, progress: 0, isTransitioning: false })
  const stateRef = useRef(state)
  const containerRef = useRef<HTMLDivElement>(null)

  const goToStage = useCallback((target: number) => {
    const stage = Math.max(0, Math.min(stageCount - 1, target))
    const next = { currentStage: stage, progress: 0, isTransitioning: false }
    stateRef.current = next
    setState(next)
    onStageChange?.(stage)
  }, [stageCount, onStageChange])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const handleWheel = (event: WheelEvent) => {
      const current = stateRef.current.currentStage
      if ((event.deltaY > 0 && current === stageCount - 1) || (event.deltaY < 0 && current === 0)) return
      event.preventDefault()
      goToStage(current + (event.deltaY > 0 ? 1 : -1))
    }
    const handleKey = (event: KeyboardEvent) => {
      if (!element.matches(':hover') && document.activeElement !== element) return
      const current = stateRef.current.currentStage
      if ((event.key === 'ArrowDown' || event.key === 'PageDown') && current < stageCount - 1) {
        event.preventDefault()
        goToStage(current + 1)
      } else if ((event.key === 'ArrowUp' || event.key === 'PageUp') && current > 0) {
        event.preventDefault()
        goToStage(current - 1)
      }
    }
    element.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKey)
    return () => {
      element.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKey)
    }
  }, [goToStage, stageCount])

  return { containerRef, state, goToStage }
}

