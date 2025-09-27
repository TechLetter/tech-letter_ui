// layouts/MainLayout.jsx
import { Outlet, Link } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <Outlet />
    </div>
  )
}
