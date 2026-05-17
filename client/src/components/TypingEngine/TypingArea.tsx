import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { useTypingEngine } from '../../hooks/useTypingEngine'
import { useSettingsStore } from '../../stores/settingsStore'
import { StatsBar } from './StatsBar'
import type { PracticeMode, TypingResult } from '../../types'

interface Props {
  text: string
  mode: PracticeMode
  onFinish: (result: TypingResult) => void
  initialIndex?: number
  onProgress?: (currentIndex: number) => void
}

export function TypingArea({ text, mode, onFinish, initialIndex, onProgress }: Props) {
  const { state, handleChar, handleBackspace, setIndex, reset, getResult } = useTypingEngine(text, mode)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastScrollIndex = useRef(-1)
  const [isComposing, setIsComposing] = useState(false)

  // Restore initial index on mount
  useEffect(() => {
    if (initialIndex && initialIndex > 0 && initialIndex < text.length) {
      setIndex(initialIndex)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Report progress
  useEffect(() => {
    onProgress?.(state.currentIndex)
  }, [state.currentIndex, onProgress])

  // Global keyboard handler — works on desktop + Bluetooth keyboard
  useEffect(() => {
    inputRef.current?.focus()

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isComposing) return

      const active = document.activeElement
      if (active && active !== inputRef.current && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return

      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus()
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        handleChar('\n')
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        e.stopPropagation()
        handleBackspace()
        return
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown, { capture: true })
    return () => document.removeEventListener('keydown', handleGlobalKeyDown, { capture: true })
  }, [handleChar, handleBackspace, isComposing])

  // beforeinput fallback for Android WebView — catches Enter/Backspace that keydown misses
  useEffect(() => {
    const el = inputRef.current
    if (!el) return

    const handleBeforeInput = (e: InputEvent) => {
      const type = e.inputType
      if (type === 'insertLineBreak' || type === 'insertParagraph') {
        e.preventDefault()
        handleChar('\n')
        // Clear any inserted content
        if (inputRef.current) inputRef.current.value = ''
        return
      }
      if (type === 'deleteContentBackward' || type === 'deleteWordBackward') {
        e.preventDefault()
        handleBackspace()
        if (inputRef.current) inputRef.current.value = ''
        return
      }
    }

    el.addEventListener('beforeinput', handleBeforeInput as EventListener)
    return () => el.removeEventListener('beforeinput', handleBeforeInput as EventListener)
  }, [handleChar, handleBackspace])

  // Move input to current character position so IME candidate box follows
  useEffect(() => {
    const container = scrollContainerRef.current
    const input = inputRef.current
    if (!container || !input) return

    const currentChar = container.querySelector(`[data-char-index="${state.currentIndex}"]`)
    if (currentChar) {
      const charRect = currentChar.getBoundingClientRect()
      input.style.position = 'fixed'
      input.style.top = `${charRect.bottom + 2}px`
      input.style.left = `${charRect.left}px`
    }
  }, [state.currentIndex])

  // Throttled scroll
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || state.currentIndex === lastScrollIndex.current) return

    const shouldScroll =
      state.currentIndex - lastScrollIndex.current >= 10 ||
      state.currentIndex === 0

    if (shouldScroll) {
      const currentChar = container.querySelector(`[data-char-index="${state.currentIndex}"]`)
      if (currentChar) {
        const containerRect = container.getBoundingClientRect()
        const charRect = currentChar.getBoundingClientRect()
        const isOutsideView =
          charRect.top < containerRect.top + 50 ||
          charRect.bottom > containerRect.bottom - 50

        if (isOutsideView) {
          currentChar.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      lastScrollIndex.current = state.currentIndex
    }
  }, [state.currentIndex])

  // Handle finish
  useEffect(() => {
    if (state.status === 'finished') {
      const result = getResult()
      if (result) {
        onFinish(result)
      }
    }
  }, [state.status, getResult, onFinish])

  // Find character index at the same X position on the previous/next line
  const findCharAtSamePosition = useCallback((direction: 'up' | 'down') => {
    const container = scrollContainerRef.current
    if (!container) return state.currentIndex

    const currentChar = container.querySelector(`[data-char-index="${state.currentIndex}"]`)
    if (!currentChar) return state.currentIndex

    const currentRect = currentChar.getBoundingClientRect()
    const targetY = direction === 'up'
      ? currentRect.top - currentRect.height / 2
      : currentRect.bottom + currentRect.height / 2
    const targetX = currentRect.left + currentRect.width / 2

    const allChars = container.querySelectorAll('[data-char-index]')
    let closestIndex = state.currentIndex
    let closestDistance = Infinity

    for (const charEl of allChars) {
      const rect = charEl.getBoundingClientRect()
      const charY = rect.top + rect.height / 2
      const charX = rect.left + rect.width / 2

      if (Math.abs(charY - targetY) > rect.height * 0.6) continue

      const distance = Math.abs(charX - targetX)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = parseInt(charEl.getAttribute('data-char-index') || '0')
      }
    }

    return closestIndex
  }, [state.currentIndex])

  // Handle keyboard events on the hidden input (for regular characters and IME)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposing) return

    // Enter and Backspace are handled by global listener, skip here
    if (e.key === 'Enter' || e.key === 'Backspace') return

    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setIndex(state.currentIndex - 1)
      return
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      setIndex(state.currentIndex + 1)
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndex(findCharAtSamePosition('up'))
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex(findCharAtSamePosition('down'))
      return
    }

    if (e.key === 'Home') {
      e.preventDefault()
      setIndex(0)
      return
    }

    if (e.key === 'End') {
      e.preventDefault()
      let lastTyped = 0
      for (let i = state.charStates.length - 1; i >= 0; i--) {
        if (state.charStates[i] !== 'pending') {
          lastTyped = i + 1
          break
        }
      }
      setIndex(lastTyped)
      return
    }

    if (e.ctrlKey || e.altKey || e.metaKey) return
    if (e.key.length !== 1) return

    if (e.key === ' ') {
      e.preventDefault()
    }

    handleChar(e.key)
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false)
    const composedText = e.data
    if (composedText) {
      for (const char of composedText) {
        handleChar(char)
      }
    }
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    if (pastedText) {
      for (const char of pastedText) {
        handleChar(char)
      }
    }
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  const handleCharClick = useCallback((index: number) => {
    setIndex(index)
    inputRef.current?.focus()
  }, [setIndex])

  // Memoize rendered characters
  const renderedChars = useMemo(() => {
    const prevChar = state.currentIndex > 0 ? text[state.currentIndex - 1] : null
    // Use inline cursor when previous char is newline or at start — avoids cursor stuck at end of previous line
    const useInlineCursor = state.currentIndex === 0 || prevChar === '\n'

    const result: React.ReactNode[] = []

    // Insert inline cursor at the very start
    if (useInlineCursor && state.currentIndex === 0 && text.length > 0) {
      result.push(
        <span key="cursor-start" className="char-cursor-inline" />
      )
    }

    text.split('').forEach((char, index) => {
      const charState = state.charStates[index]
      const typedChar = state.typedChars[index]
      // Cursor on last typed char (right side) — but not when previous char was \n (handled by inline cursor below)
      const hasCursor = index === state.currentIndex - 1 && state.currentIndex > 0 && !useInlineCursor
      const isCode = mode === 'code'

      const displayChar = charState === 'error' && typedChar ? typedChar : char

      const style: React.CSSProperties = {
        fontFamily: isCode ? 'JetBrains Mono, monospace' : 'inherit',
        fontSize: `${isCode ? fontSize * 0.9 : fontSize}px`,
        letterSpacing: isCode ? '0' : '0.02em',
        color: charState === 'error' ? 'var(--error)' :
               charState === 'correct' ? 'var(--text-primary)' :
               'var(--text-muted)',
        textDecoration: charState === 'error' ? 'underline wavy var(--error)' : 'none',
        position: 'relative',
        display: 'inline-block',
        minWidth: char === ' ' ? '0.5em' : undefined,
      }

      if (char === '\n') {
        result.push(
          <span
            key={index}
            data-char-index={index}
            style={{ ...style, display: 'block', height: '1em' }}
            className={`cursor-pointer ${hasCursor ? 'char-cursor' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleCharClick(index); }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7em', userSelect: 'none' }}>↵</span>
          </span>
        )
        // Insert inline cursor right after \n when cursor is at start of next line
        if (useInlineCursor && index + 1 === state.currentIndex) {
          result.push(
            <span key={`cursor-${index}`} className="char-cursor-inline" />
          )
        }
        return
      }

      result.push(
        <span
          key={index}
          data-char-index={index}
          className={`inline-block cursor-pointer ${hasCursor ? 'char-cursor' : ''}`}
          style={style}
          onClick={(e) => { e.stopPropagation(); handleCharClick(index); }}
        >
          {displayChar}
        </span>
      )
    })

    return result
  }, [text, state.charStates, state.typedChars, state.currentIndex, mode, fontSize, handleCharClick])

  return (
    <div className="space-y-4">
      <StatsBar
        wpm={state.wpm}
        accuracy={state.accuracy}
        progress={state.currentIndex / text.length}
        status={state.status}
      />

      <div
        onClick={handleContainerClick}
        className="rounded-xl outline-none cursor-text select-none"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          minHeight: '200px',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onPaste={handlePaste}
          style={{
            position: 'fixed',
            opacity: 0.01,
            width: '1px',
            height: '1px',
            top: '50%',
            left: '50%',
            zIndex: 9999,
            fontSize: '16px',
            caretColor: 'transparent',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'transparent',
          }}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        <style>{`
          .char-cursor::after {
            content: '';
            position: absolute;
            right: -1px;
            top: 0;
            bottom: 0;
            width: 2px;
            background-color: var(--accent);
            animation: blink 1s step-end infinite;
          }
          .char-cursor-inline {
            display: inline-block;
            position: relative;
            width: 2px;
            height: 1.2em;
            vertical-align: text-bottom;
            background-color: var(--accent);
            animation: blink 1s step-end infinite;
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>

        {state.status !== 'typing' && (
          <div className="flex items-center justify-between text-xs px-6 py-3" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)' }}>
            <span>点击开始输入 | ←→ 移动光标 | Home/End 跳转</span>
            <span>{state.currentIndex} / {text.length} 字符</span>
          </div>
        )}

        <div
          ref={scrollContainerRef}
          className="overflow-y-auto"
          style={{
            padding: '1.5rem',
            lineHeight: mode === 'code' ? '1.8' : '2',
            fontSize: `${fontSize}px`,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            maxHeight: '60vh',
          }}
        >
          {renderedChars}
        </div>
      </div>
    </div>
  )
}
