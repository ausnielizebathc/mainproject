import mongoose from 'mongoose'
import dotenv from 'dotenv'
import colors from 'colors'
import restaurants from './data/restaurents.js'
import orders from './data/orders.js'
import users from './data/users.js'
import cooks from './data/cooks.js'
import tips from './data/tips.js'
import Restaurant from './models/restaurantModel.js'
import Order from './models/orderModel.js'
import User from './models/userModel.js'
import Cook from './models/cookModel.js'
import Tip from './models/tipModel.js'
import connectDB from './config/db.js'

dotenv.config()

connectDB()

const importData = async () => {
  try {
    await Restaurant.deleteMany()
    await Order.deleteMany()
    await User.deleteMany()
    await Cook.deleteMany()
    await Tip.deleteMany()

     await Restaurant.insertMany(restaurants)
     await Order.insertMany(orders)
     await User.insertMany(users)
     await Cook.insertMany(cooks)
     await Tip.insertMany(tips)


    console.log('Data Imported!'.green.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

const destroyData = async () => {
  try {
    await Restaurant.deleteMany()
    await Order.deleteMany()
    await User.deleteMany()
    await Cook.deleteMany()
    await Tip.deleteMany()

    console.log('Data Destroyed!'.red.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}