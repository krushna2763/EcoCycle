import { Outlet, useRouterState } from '@tanstack/react-router'
import Navbar from '../components/sections/Navbar'
import Footer from '../components/sections/Footer'

export default function RootLayout() {
  const { location } = useRouterState({ select: (s) => ({ location: s.location }) })
  const isDashboard = location.pathname.startsWith('/seller/dashboard')

  return (
    <>
      {!isDashboard && <Navbar />}
      {!isDashboard && <div className="h-[4.5rem] lg:h-[5rem]" />}
      <Outlet />
      {!isDashboard && <Footer />}
    </>
  )
}
