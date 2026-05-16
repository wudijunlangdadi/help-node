import { useState, useCallback, useRef, useEffect } from 'react'
import type { TypingState, TypingResult, PracticeMode } from '../types'

export function useTypingEngine(text: string, mode: PracticeMode) {
  const [state, setState] = useState<TypingState>({
    status: 'idle',
    text,
    currentIndex: 0,
    correctChars: 0,
    errorChars: 0,
    totalKeystrokes: 0,
    startTime: null,
    endTime: null,
    errors: {},
    wpm: 0,
    accuracy: 100,
    charStates: Array(text.length).fill('pending'),
    typedChars: Array(text.length).fill(''),
  })

  const startTimeRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)

  // Reset when text changes
  useEffect(() => {
    reset()
  }, [text])

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    startTimeRef.current = null
    setState({
      status: 'idle',
      text,
      currentIndex: 0,
      correctChars: 0,
      errorChars: 0,
      totalKeystrokes: 0,
      startTime: null,
      endTime: null,
      errors: {},
      wpm: 0,
      accuracy: 100,
      charStates: Array(text.length).fill('pending'),
      typedChars: Array(text.length).fill(''),
    })
  }, [text])

  const calculateWpm = useCallback((correctChars: number, startTime: number) => {
    const elapsedMinutes = (Date.now() - startTime) / 60000
    if (elapsedMinutes === 0) return 0
    return Math.round((correctChars / 5) / elapsedMinutes)
  }, [])

  const calculateAccuracy = useCallback((correctChars: number, totalKeystrokes: number) => {
    if (totalKeystrokes === 0) return 100
    return Math.round((correctChars / totalKeystrokes) * 1000) / 10
  }, [])

  const handleChar = useCallback((char: string) => {
    setState(prev => {
      if (prev.status === 'finished') return prev

      const { text, currentIndex, correctChars, errorChars, totalKeystrokes, errors, charStates, typedChars } = prev

      // Start timing on first keystroke
      let startTime = prev.startTime
      if (prev.status === 'idle') {
        startTime = Date.now()
        startTimeRef.current = startTime
      }

      // If no more characters to type, finish
      if (currentIndex >= text.length) {
        return {
          ...prev,
          status: 'finished',
          endTime: Date.now(),
          startTime,
        }
      }

      const expectedChar = text[currentIndex]
      const isCorrect = char === expectedChar

      const newCharStates = [...charStates]
      const newTypedChars = [...typedChars]
      newCharStates[currentIndex] = isCorrect ? 'correct' : 'error'
      newTypedChars[currentIndex] = char

      // Mark next char as current if exists
      if (currentIndex + 1 < text.length) {
        newCharStates[currentIndex + 1] = 'current'
      }

      const newCorrectChars = isCorrect ? correctChars + 1 : correctChars
      const newErrorChars = isCorrect ? errorChars : errorChars + 1
      const newTotalKeystrokes = totalKeystrokes + 1
      const newErrors = isCorrect ? errors : {
        ...errors,
        [expectedChar]: (errors[expectedChar] || 0) + 1,
      }

      const newWpm = calculateWpm(newCorrectChars, startTime!)
      const newAccuracy = calculateAccuracy(newCorrectChars, newTotalKeystrokes)

      const newIndex = currentIndex + 1
      const isFinished = newIndex >= text.length

      return {
        ...prev,
        status: isFinished ? 'finished' : 'typing',
        currentIndex: newIndex,
        correctChars: newCorrectChars,
        errorChars: newErrorChars,
        totalKeystrokes: newTotalKeystrokes,
        startTime,
        endTime: isFinished ? Date.now() : null,
        errors: newErrors,
        wpm: newWpm,
        accuracy: newAccuracy,
        charStates: newCharStates,
        typedChars: newTypedChars,
      }
    })
  }, [calculateWpm, calculateAccuracy])

  const handleBackspace = useCallback(() => {
    setState(prev => {
      if (prev.status === 'finished' || prev.currentIndex === 0) return prev

      const { text, currentIndex, correctChars, errorChars, totalKeystrokes, charStates, typedChars, startTime } = prev
      const newIndex = currentIndex - 1
      const newCharStates = [...charStates]
      const newTypedChars = [...typedChars]

      // Reset current character state to pending
      if (currentIndex < text.length) {
        newCharStates[currentIndex] = 'pending'
        newTypedChars[currentIndex] = ''
      }

      // Check what state the character we're going back to was in
      const prevState = newCharStates[newIndex]
      const wasError = prevState === 'error'
      const wasCorrect = prevState === 'correct'

      // Mark the character we're going back to as current
      newCharStates[newIndex] = 'current'
      newTypedChars[newIndex] = ''

      // Update stats based on what we're undoing
      let newCorrectChars = correctChars
      let newErrorChars = errorChars
      let newTotalKeystrokes = totalKeystrokes

      if (wasError) {
        newErrorChars = Math.max(0, errorChars - 1)
        newTotalKeystrokes = Math.max(0, totalKeystrokes - 1)
      } else if (wasCorrect) {
        newCorrectChars = Math.max(0, correctChars - 1)
        newTotalKeystrokes = Math.max(0, totalKeystrokes - 1)
      }

      const newWpm = startTime ? calculateWpm(newCorrectChars, startTime) : 0
      const newAccuracy = calculateAccuracy(newCorrectChars, newTotalKeystrokes)

      return {
        ...prev,
        status: 'typing',
        currentIndex: newIndex,
        correctChars: newCorrectChars,
        errorChars: newErrorChars,
        totalKeystrokes: newTotalKeystrokes,
        charStates: newCharStates,
        typedChars: newTypedChars,
        wpm: newWpm,
        accuracy: newAccuracy,
      }
    })
  }, [calculateWpm, calculateAccuracy])

  const setIndex = useCallback((newIndex: number) => {
    setState(prev => {
      if (newIndex < 0 || newIndex > prev.text.length) return prev

      // Reset all states after the new index
      const newCharStates = [...prev.charStates]
      const newTypedChars = [...prev.typedChars]

      // If moving backward, reset states from newIndex onwards
      if (newIndex < prev.currentIndex) {
        for (let i = newIndex; i < prev.text.length; i++) {
          newCharStates[i] = 'pending'
          newTypedChars[i] = ''
        }

        // Recalculate stats for characters before newIndex
        let correctChars = 0
        let errorChars = 0
        const errors: Record<string, number> = {}

        for (let i = 0; i < newIndex; i++) {
          if (prev.charStates[i] === 'correct') {
            correctChars++
          } else if (prev.charStates[i] === 'error') {
            errorChars++
            const expectedChar = prev.text[i]
            errors[expectedChar] = (errors[expectedChar] || 0) + 1
          }
        }

        const totalKeystrokes = correctChars + errorChars
        const startTime = prev.startTime
        const wpm = startTime ? calculateWpm(correctChars, startTime) : 0
        const accuracy = calculateAccuracy(correctChars, totalKeystrokes)

        // Mark new position as current
        if (newIndex < prev.text.length) {
          newCharStates[newIndex] = 'current'
        }

        return {
          ...prev,
          currentIndex: newIndex,
          charStates: newCharStates,
          typedChars: newTypedChars,
          correctChars,
          errorChars,
          totalKeystrokes,
          errors,
          wpm,
          accuracy,
          status: newIndex === 0 ? 'idle' : 'typing',
        }
      }

      // Moving forward - just update the current marker
      if (prev.currentIndex < prev.text.length) {
        newCharStates[prev.currentIndex] = prev.charStates[prev.currentIndex] === 'pending' ? 'pending' : prev.charStates[prev.currentIndex]
      }
      if (newIndex < prev.text.length) {
        newCharStates[newIndex] = 'current'
      }

      return {
        ...prev,
        currentIndex: newIndex,
        charStates: newCharStates,
      }
    })
  }, [calculateWpm, calculateAccuracy])

  const getResult = useCallback((): TypingResult | null => {
    if (state.status !== 'finished' || !state.startTime || !state.endTime) return null
    return {
      wpm: state.wpm,
      accuracy: state.accuracy,
      errorCount: state.errorChars,
      duration: Math.round((state.endTime - state.startTime) / 1000),
      errorChars: state.errors,
      correctChars: state.correctChars,
      totalKeystrokes: state.totalKeystrokes,
    }
  }, [state])

  // Auto-update WPM while typing
  useEffect(() => {
    if (state.status === 'typing' && startTimeRef.current) {
      timerRef.current = window.setInterval(() => {
        setState(prev => {
          if (prev.status !== 'typing' || !prev.startTime) return prev
          return {
            ...prev,
            wpm: calculateWpm(prev.correctChars, prev.startTime),
          }
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [state.status, calculateWpm])

  return {
    state,
    handleChar,
    handleBackspace,
    setIndex,
    reset,
    getResult,
  }
}
