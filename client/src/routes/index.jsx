import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import RootLayout from './RootLayout'
import DashboardLayout from './DashboardLayout'
import Home from '../pages/Home/Home'
import About from '../pages/About/About'
import HowItWorks from '../pages/HowItWorks/HowItWorks'
import Categories from '../pages/Categories/Categories'
import Impact from '../pages/Impact/Impact'
import Contact from '../pages/Contact/Contact'
import Login from '../pages/Auth/Login'
import Signup from '../pages/Auth/Signup'
import SellerRegistration from '../pages/Auth/SellerRegistration'
import BuyerRegistration from '../pages/Auth/BuyerRegistration'
import SellerDashboard from '../pages/Seller/SellerDashboard'
import MyListings from '../pages/Seller/MyListings'
import AddPlasticWaste from '../pages/Seller/AddPlasticWaste'
import Requests from '../pages/Seller/Requests'
import Collections from '../pages/Seller/Collections'
import Messages from '../pages/Seller/Messages'
import Profile from '../pages/Seller/Profile'
import Settings from '../pages/Seller/Settings'
import Notifications from '../pages/Seller/Notifications'
import NotFound from '../pages/NotFound'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
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

const sellerRegistrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register-seller',
  component: SellerRegistration,
})

const buyerRegistrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register-buyer',
  component: BuyerRegistration,
})

const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'seller-dashboard',
  component: DashboardLayout,
})

const sellerDashboardRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/seller/dashboard',
  component: SellerDashboard,
})

const myListingsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/seller/dashboard/listings',
  component: MyListings,
})

const addPlasticWasteRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/seller/dashboard/add-listing',
  component: AddPlasticWaste,
})

const requestsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/seller/dashboard/requests',
  component: Requests,
})

const collectionsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/seller/dashboard/collections',
  component: Collections,
})

const messagesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/seller/dashboard/messages',
  component: Messages,
})

const profileRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/seller/dashboard/profile',
  component: Profile,
})

const settingsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/seller/dashboard/settings',
  component: Settings,
})

const notificationsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/seller/dashboard/notifications',
  component: Notifications,
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
  sellerRegistrationRoute,
  buyerRegistrationRoute,
  dashboardLayoutRoute.addChildren([
    sellerDashboardRoute,
    myListingsRoute,
    addPlasticWasteRoute,
    requestsRoute,
    collectionsRoute,
    messagesRoute,
    notificationsRoute,
    profileRoute,
    settingsRoute,
  ]),
  notFoundRoute,
])

export const router = createRouter({ routeTree })
