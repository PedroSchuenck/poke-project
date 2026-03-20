export function StatPill({ label, value, icon }) {

  function statPercent(value, max = 255) {
    return Math.min(100, Math.round((value / max) * 100))
  }

  const percent = statPercent(value)
  return (
    <div className='stat-pill'>
      <div className='stat-pill-head'>
        <span className='stat-pill-label'>
          {icon}
          {label}
        </span>
        <strong className='stat-pill-value'>
          {value}
          <small>{percent}%</small>
        </strong>
      </div>
      <div className='stat-track'>
        <div className='stat-fill' style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}