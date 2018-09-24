// pages/index.js
import Link from 'next/link'

export default () => (
  <div>
    <p>
      👋 la bouffe front 😻
    </p>
    <Link prefetch href="/cow">
      Meuh
    </Link>{' '}
  </div>
)
