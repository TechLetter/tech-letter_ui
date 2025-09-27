import { lazy } from 'react'
import { PATHS } from './path'

const Home = lazy(() => import('../pages/Home'))

export const ROUTES = [
  { path: PATHS.HOME, element: <Home /> },
]
