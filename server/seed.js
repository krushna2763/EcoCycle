import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Seller from './models/Seller.js'
import Listing from './models/Listing.js'
import Request from './models/Request.js'

dotenv.config()

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected for seeding')

    // Clear existing data
    await Seller.deleteMany({})
    await Listing.deleteMany({})
    await Request.deleteMany({})

    // Create a test seller
    const seller = await Seller.create({
      fullName: 'Krushna Bhagawat',
      phone: '9876543210',
      email: 'krushna@ecocycle.com',
      password: 'password123',
      sellerType: 'individual',
      city: 'Pune',
      pincode: '411045',
      pickupAddress: 'Baner Road, Pune',
      plasticTypes: ['PET', 'HDPE', 'Mixed'],
      collectionSource: 'Home collection',
      averageQuantity: '50-100 kg',
    })

    // Create sample listings
    const listings = await Listing.insertMany([
      {
        seller: seller._id,
        title: 'PET Plastic Bottles',
        plasticType: 'PET',
        quantity: 50,
        pricePerKg: 30,
        location: 'Pune, Maharashtra',
        status: 'approved',
        image: '/listings/pet-bottles.jpg',
        viewCount: 24,
      },
      {
        seller: seller._id,
        title: 'HDPE Containers',
        plasticType: 'HDPE',
        quantity: 25,
        pricePerKg: 25,
        location: 'Pimpri, Maharashtra',
        status: 'pending',
        image: '/listings/hdpe-containers.jpg',
        viewCount: 10,
      },
      {
        seller: seller._id,
        title: 'Mixed Plastic',
        plasticType: 'Mixed',
        quantity: 30,
        pricePerKg: 20,
        location: 'Pune, Maharashtra',
        status: 'approved',
        image: '/listings/mixed-plastic.jpg',
        viewCount: 18,
      },
    ])

    // Create sample requests
    await Request.insertMany([
      {
        seller: seller._id,
        listing: listings[0]._id,
        companyName: 'GreenCycle Pvt. Ltd.',
        interestedPlasticType: 'PET Plastic Bottles',
        quantity: 50,
        location: 'Pune',
        status: 'pending',
      },
      {
        seller: seller._id,
        listing: listings[1]._id,
        companyName: 'Eco Recyclers',
        interestedPlasticType: 'HDPE Containers',
        quantity: 25,
        location: 'Pimpri',
        status: 'accepted',
      },
      {
        seller: seller._id,
        listing: listings[2]._id,
        companyName: 'ReUse Industries',
        interestedPlasticType: 'Mixed Plastic',
        quantity: 30,
        location: 'Pune',
        status: 'rejected',
      },
    ])

    console.log('Seed data created successfully!')
    console.log('Test login: krushna@ecocycle.com / password123')
    process.exit(0)
  } catch (error) {
    console.error('Seeding error:', error)
    process.exit(1)
  }
}

seedData()
