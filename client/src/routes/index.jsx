import { createRootRoute, createRoute, createRouter, lazyRouteComponent } from '@tanstack/react-router'
import RootLayout from './RootLayout'
import DashboardLayout from './DashboardLayout'
import BuyerDashboardLayout from './BuyerDashboardLayout'
import AdminDashboardLayout from './AdminDashboardLayout'
import PageLoading from '../components/common/PageLoading'

// Pages are loaded on demand, one chunk per page; the layouts (navbar, sidebars, route guards)
// stay in the main bundle
const Home = lazyRouteComponent(() => import('../pages/Home/Home'))
const About = lazyRouteComponent(() => import('../pages/About/About'))
const HowItWorks = lazyRouteComponent(() => import('../pages/HowItWorks/HowItWorks'))
const Categories = lazyRouteComponent(() => import('../pages/Categories/Categories'))
const Impact = lazyRouteComponent(() => import('../pages/Impact/Impact'))
const Contact = lazyRouteComponent(() => import('../pages/Contact/Contact'))
const Login = lazyRouteComponent(() => import('../pages/Auth/Login'))
const Signup = lazyRouteComponent(() => import('../pages/Auth/Signup'))
const SellerRegistration = lazyRouteComponent(() => import('../pages/Auth/SellerRegistration'))
const BuyerRegistration = lazyRouteComponent(() => import('../pages/Auth/BuyerRegistration'))
const SellerDashboard = lazyRouteComponent(() => import('../pages/Seller/SellerDashboard'))
const MyListings = lazyRouteComponent(() => import('../pages/Seller/MyListings'))
const AddPlasticWaste = lazyRouteComponent(() => import('../pages/Seller/AddPlasticWaste'))
const Requests = lazyRouteComponent(() => import('../pages/Seller/Requests'))
const Collections = lazyRouteComponent(() => import('../pages/Seller/Collections'))
const Messages = lazyRouteComponent(() => import('../pages/Seller/Messages'))
const Profile = lazyRouteComponent(() => import('../pages/Seller/Profile'))
const Settings = lazyRouteComponent(() => import('../pages/Seller/Settings'))
const Notifications = lazyRouteComponent(() => import('../pages/Seller/Notifications'))
const BuyerDashboard = lazyRouteComponent(() => import('../pages/Buyer/BuyerDashboard'))
const BrowseListings = lazyRouteComponent(() => import('../pages/Buyer/BrowseListings'))
const ListingDetails = lazyRouteComponent(() => import('../pages/Buyer/ListingDetails'))
const MyRequests = lazyRouteComponent(() => import('../pages/Buyer/MyRequests'))
const BuyerCollections = lazyRouteComponent(() => import('../pages/Buyer/BuyerCollections'))
const BuyerProfile = lazyRouteComponent(() => import('../pages/Buyer/BuyerProfile'))
const BuyerSettings = lazyRouteComponent(() => import('../pages/Buyer/BuyerSettings'))
const BuyerNotifications = lazyRouteComponent(() => import('../pages/Buyer/BuyerNotifications'))
const AdminDashboard = lazyRouteComponent(() => import('../pages/Admin/AdminDashboard'))
const PendingListings = lazyRouteComponent(() => import('../pages/Admin/PendingListings'))
const ReviewListing = lazyRouteComponent(() => import('../pages/Admin/ReviewListing'))
const AdminUsers = lazyRouteComponent(() => import('../pages/Admin/AdminUsers'))
const NotFound = lazyRouteComponent(() => import('../pages/NotFound'))

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
// ── Buyer Dashboard Layout & Subroutes ──
const buyerDashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'buyer-dashboard',
  component: BuyerDashboardLayout,
})

const buyerDashboardRoute = createRoute({
  getParentRoute: () => buyerDashboardLayoutRoute,
  path: '/buyer/dashboard',
  component: BuyerDashboard,
})

const buyerBrowseListingsRoute = createRoute({
  getParentRoute: () => buyerDashboardLayoutRoute,
  path: '/buyer/dashboard/listings',
  component: BrowseListings,
})

const buyerListingDetailsRoute = createRoute({
  getParentRoute: () => buyerDashboardLayoutRoute,
  path: '/buyer/dashboard/listings/$id',
  component: ListingDetails,
})

const buyerRequestsRoute = createRoute({
  getParentRoute: () => buyerDashboardLayoutRoute,
  path: '/buyer/dashboard/requests',
  component: MyRequests,
})

const buyerCollectionsRoute = createRoute({
  getParentRoute: () => buyerDashboardLayoutRoute,
  path: '/buyer/dashboard/collections',
  component: BuyerCollections,
})

const buyerMessagesRoute = createRoute({
  getParentRoute: () => buyerDashboardLayoutRoute,
  path: '/buyer/dashboard/messages',
  component: Messages,
})

const buyerProfileRoute = createRoute({
  getParentRoute: () => buyerDashboardLayoutRoute,
  path: '/buyer/dashboard/profile',
  component: BuyerProfile,
})

const buyerSettingsRoute = createRoute({
  getParentRoute: () => buyerDashboardLayoutRoute,
  path: '/buyer/dashboard/settings',
  component: BuyerSettings,
})

const buyerNotificationsRoute = createRoute({
  getParentRoute: () => buyerDashboardLayoutRoute,
  path: '/buyer/dashboard/notifications',
  component: BuyerNotifications,
})

// ── Admin Dashboard Layout & Subroutes ──
const adminDashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin-dashboard',
  component: AdminDashboardLayout,
})

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminDashboardLayoutRoute,
  path: '/admin/dashboard',
  component: AdminDashboard,
})

const adminPendingListingsRoute = createRoute({
  getParentRoute: () => adminDashboardLayoutRoute,
  path: '/admin/dashboard/listings',
  component: PendingListings,
})

const adminReviewListingRoute = createRoute({
  getParentRoute: () => adminDashboardLayoutRoute,
  path: '/admin/dashboard/listings/$id',
  component: ReviewListing,
})

const adminUsersRoute = createRoute({
  getParentRoute: () => adminDashboardLayoutRoute,
  path: '/admin/dashboard/users',
  component: AdminUsers,
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
  buyerDashboardLayoutRoute.addChildren([
    buyerDashboardRoute,
    buyerBrowseListingsRoute,
    buyerListingDetailsRoute,
    buyerRequestsRoute,
    buyerCollectionsRoute,
    buyerMessagesRoute,
    buyerNotificationsRoute,
    buyerProfileRoute,
    buyerSettingsRoute,
  ]),
  adminDashboardLayoutRoute.addChildren([
    adminDashboardRoute,
    adminPendingListingsRoute,
    adminReviewListingRoute,
    adminUsersRoute,
  ]),
  notFoundRoute,
])

export const router = createRouter({ routeTree, defaultPendingComponent: PageLoading })
