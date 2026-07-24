const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

export default function Spinner({ size = 'md', className = '', color = 'blue' }) {
  const colorMap = {
    blue:  'text-blue-500',
    red:   'text-red-500',
    white: 'text-white',
    green: 'text-emerald-500',
  }
  return (
    <div className={`${sizes[size]} ${className} ${colorMap[color] ?? colorMap.blue} animate-spin`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"
          className="opacity-15" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" />
      </svg>
    </div>
  )
}
