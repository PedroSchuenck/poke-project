import { ChevronDown } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function Dropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  const selected = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    function onPointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false)
    }
    function onEsc(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onEsc)
    }
  }, [])

  return (
    <div className={`dropdown ${open ? 'open' : ''}`} ref={wrapperRef}>
      <button className='dropdown-trigger' type='button' onClick={() => setOpen((current) => !current)}>
        <span>{selected?.label ?? '-'}</span>
        <ChevronDown size={15} />
      </button>
      {open ? (
        <div className='dropdown-menu'>
          {options.map((option) => (
            <button
              key={option.value}
              type='button'
              className={`dropdown-option ${option.value === value ? 'active' : ''}`}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}