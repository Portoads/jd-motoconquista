import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { RequireAdmin } from '@/pages/admin/RequireAdmin'
import Home from '@/pages/public/Home'

const Catalog = lazy(() => import('@/pages/public/Catalog'))
const MotoDetail = lazy(() => import('@/pages/public/MotoDetail'))
const Services = lazy(() => import('@/pages/public/Services'))
const Rental = lazy(() => import('@/pages/public/Rental'))
const About = lazy(() => import('@/pages/public/About'))
const Contact = lazy(() => import('@/pages/public/Contact'))
const Faq = lazy(() => import('@/pages/public/Faq'))
const Privacy = lazy(() => import('@/pages/public/Legal').then((m) => ({ default: m.Privacy })))
const Terms = lazy(() => import('@/pages/public/Legal').then((m) => ({ default: m.Terms })))
const NotFound = lazy(() => import('@/pages/public/NotFound'))

const Login = lazy(() => import('@/pages/admin/Login'))
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'))
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'))
const MotosList = lazy(() => import('@/pages/admin/MotosList'))
const MotoForm = lazy(() => import('@/pages/admin/MotoForm'))
const Leads = lazy(() => import('@/pages/admin/Leads'))
const FaqAdmin = lazy(() => import('@/pages/admin/FaqAdmin'))
const SettingsAdmin = lazy(() => import('@/pages/admin/SettingsAdmin'))

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/motos', element: <Catalog /> },
      { path: '/motos/:slug', element: <MotoDetail /> },
      { path: '/servicos', element: <Services /> },
      { path: '/aluguel', element: <Rental /> },
      { path: '/sobre', element: <About /> },
      { path: '/contato', element: <Contact /> },
      { path: '/faq', element: <Faq /> },
      { path: '/politica-de-privacidade', element: <Privacy /> },
      { path: '/termos-de-uso', element: <Terms /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/admin/login', element: <Login /> },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'motos', element: <MotosList /> },
      { path: 'motos/nova', element: <MotoForm key="new" /> },
      { path: 'motos/:id', element: <MotoForm /> },
      { path: 'leads', element: <Leads /> },
      { path: 'faq', element: <FaqAdmin /> },
      { path: 'configuracoes', element: <SettingsAdmin /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
