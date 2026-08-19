import Hero from '../../components/sections/Hero'
import CategoryBar from '../../components/sections/CategoryBar'
import HowItWorks from '../../components/sections/HowItWorks'
import SellerBuyerCards from '../../components/sections/SellerBuyerCards'
import StatsBanner from '../../components/sections/StatsBanner'

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryBar />
      <HowItWorks />
      <SellerBuyerCards />
      <StatsBanner />
    </>
  )
}
