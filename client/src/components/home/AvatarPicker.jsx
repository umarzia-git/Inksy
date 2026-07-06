import { AVATAR_CATEGORIES } from '../../utils/constants.js'

function AvatarPicker({ selected, onSelect }) {
  return (
    <div className="flex flex-col gap-4">
      {AVATAR_CATEGORIES.map((category) => (
        <div key={category.name}>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-text/60">
            {category.name}
          </p>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
            {category.avatars.map((avatar) => (
              <button
                key={avatar}
                type="button"
                aria-pressed={selected === avatar}
                onClick={() => onSelect(avatar)}
                className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl transition ${
                  selected === avatar ? 'bg-ink-coral' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AvatarPicker
