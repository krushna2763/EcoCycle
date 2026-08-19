import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import RootLayout from './RootLayout'
import Home from '../pages/Home/Home'
import About from '../pages/About/About'
import HowItWorks from '../pages/HowItWorks/HowItWorks'
import Categories from '../pages/Categories/Categories'
import Impact from '../pages/Impact/Impact'
import Contact from '../pages/Contact/Contact'
import Login from '../pages/Auth/Login'
import Signup from '../pages/Auth/Signup'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About,
})

const howItWorksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/how-it-works',
  component: HowItWorks,
})

const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/categories',
  component: Categories,
})

const impactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/impact',
  component: Impact,
})

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: Contact,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: Signup,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  aboutRoute,
  howItWorksRoute,
  categoriesRoute,
  impactRoute,
  contactRoute,
  loginRoute,
  signupRoute,
])

export const router = createRouter({ routeTree })
