import React from 'react'
import Header from '../assets/components/Header'
import Hero from '../assets/components/Hero'
import MenuSection from '../assets/components/MenuSection'
import Gallery from '../assets/components/Gallery'
import Footer from '../assets/components/Footer'
import PromoCards from '../assets/components/PromoCards'

function OnePage() {
  return (
    <>
      <Header />
      <Hero />
      <MenuSection />
      <PromoCards />
      <Gallery />
      <Footer />
    </>
  )
}

export default OnePage