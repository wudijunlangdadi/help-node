import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { useTypingEngine } from '../../hooks/useTypingEngine'
import { useSettingsStore } from '../../stores/settingsStore'
import { StatsBar } from './StatsBar'
import type { PracticeMode, TypingResult } from '../../types'

interface Props {
  text: string
  mode: PracticeMode
  onFinish: (result: TypingResult) => void
}

export function TypingArea({ text, mode, onFinish }: Props) {
  const { state, handleChar, handleBackspace, setIndex, reset, getResult } = useTypingEngine(text, mode)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastScrollIndex = useRef(-1)
  const [isComposing, setIsComposing] = useState(false)

  // Auto-focus and global keyboard handler for Android Bluetooth keyboard
  useEffect(() => {
    inputRef.current?.focus()

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Only handle when no other input/textarea is focused
      const active = document.activeElement
      if (active && active !== inputRef.current && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return

      // Re-focus our hidden input if needed
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus()
      }

      // Forward the event to our handler
      if (inputRef.current) {
        inputRef.current.dispatchEvent(new KeyboardEvent('keydown', {
          key: e.key,
          code: e.code,
          keyCode: e.keyCode,
          bubbles: true,
        }))
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Move input to current character position so IME candidate box follows
  useEffect(() => {
    const container = scrollContainerRef.current
    const input = inputRef.current
    if (!container || !input) return

    const currentChar = container.querySelector(`[data-char-index="${state.currentIndex}"]`)
    if (currentChar) {
      const charRect = currentChar.getBoundingClientRect()

      // Use fixed positioning relative to viewport for accurate IME placement
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
        setTimeout(() => onFinish(result), 300)
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

    // Find the character closest to the target position
    const allChars = container.querySelectorAll('[data-char-index]')
    let closestIndex = state.currentIndex
    let closestDistance = Infinity

    for (const charEl of allChars) {
      const rect = charEl.getBoundingClientRect()
      const charY = rect.top + rect.height / 2
      const charX = rect.left + rect.width / 2

      // Must be on the target line (within half a line height)
      if (Math.abs(charY - targetY) > rect.height * 0.6) continue

      // Find closest X position
      const distance = Math.abs(charX - targetX)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = parseInt(charEl.getAttribute('data-char-index') || '0')
      }
    }

    return closestIndex
  }, [state.currentIndex])

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // During composition (IME active), don't process
    if (isComposing) return

    // Arrow keys for cursor movement
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
      const newIndex = findCharAtSamePosition('up')
      setIndex(newIndex)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = findCharAtSamePosition('down')
      setIndex(newIndex)
      return
    }

    // Home key - go to beginning
    if (e.key === 'Home') {
      e.preventDefault()
      setIndex(0)
      return
    }

    // End key - go to end of typed content
    if (e.key === 'End') {
      e.preventDefault()
      // Find the last non-pending character
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

    if (e.key === 'Backspace') {
      e.preventDefault()
      handleBackspace()
      return
    }

    // Ignore modifier and non-printable keys
    if (e.ctrlKey || e.altKey || e.metaKey) return
    if (e.key.length !== 1) return

    // Prevent default for space to avoid scrolling
    if (e.key === ' ') {
      e.preventDefault()
    }

    handleChar(e.key)
  }

  // Handle IME composition
  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false)
    // Process the composed characters
    const composedText = e.data
    if (composedText) {
      for (const char of composedText) {
        handleChar(char)
      }
    }
    // Clear the input
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    if (pastedText) {
      for (const char of pastedText) {
        handleChar(char)
      }
    }
  }

  // Click to focus
  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  // Click on a character to move cursor there
  const handleCharClick = useCallback((index: number) => {
    setIndex(index)
    inputRef.current?.focus()
  }, [setIndex])

  // Memoize rendered characters
  const renderedChars = useMemo(() => {
    return text.split('').map((char, index) => {
      const charState = state.charStates[index]
      const typedChar = state.typedChars[index]
      const isCurrent = index === state.currentIndex
      const isCode = mode === 'code'

      // For error state, show the typed character (in red)
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
        return (
          <span
            key={index}
            data-char-index={index}
            style={style}
            className={`inline cursor-pointer ${isCurrent ? 'char-cursor' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleCharClick(index); }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7em', userSelect: 'none' }}>↵</span>
            <br />
          </span>
        )
      }

      return (
        <span
          key={index}
          data-char-index={index}
          className={`inline-block cursor-pointer ${isCurrent ? 'char-cursor' : ''}`}
          style={style}
          onClick={(e) => { e.stopPropagation(); handleCharClick(index); }}
        >
          {displayChar}
        </span>
      )
    })
  }, [text, state.charStates, state.typedChars, state.currentIndex, mode])

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
          maxHeight: '60vh',
        }}
      >
        {/* Input for capturing keyboard/IME input - positioned at current char */}
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
            fontSize: '16px', // Prevent iOS zoom
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
          .char-cursor::before {
            content: '';
            position: absolute;
            left: -1px;
            top: 2px;
            bottom: 2px;
            width: 2px;
            background-color: var(--accent);
            animation: blink 1s step-end infinite;
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>

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

      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>点击开始输入 | ←→ 移动光标 | Home/End 跳转</span>
        <span>{state.currentIndex} / {text.length} 字符</span>
      </div>
    </div>
  )
}
