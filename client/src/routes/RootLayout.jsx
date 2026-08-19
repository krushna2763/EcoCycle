import { Outlet } from '@tanstack/react-router'
import Navbar from '../components/sections/Navbar'
import Footer from '../components/sections/Footer'

export default function RootLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}
