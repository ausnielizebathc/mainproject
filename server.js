import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import colors from 'colors'
import {notFound, errorHandler} from "./middleware/errorMiddleware.js"
import  connectDB from "./config/db.js"
import asyncHandler from 'express-async-handler'

import Restaurant from './models/restaurantModel.js'
import Order from './models/orderModel.js'
import userRoutes from './routes/userRoutes.js'
import restaurentRoutes  from './routes/restaurentRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import tipRoutes from './routes/tipRoutes.js'
import stripePackage from 'stripe';

const stripe = stripePackage('sk_test_51NIXdrSJv6spOPlPc1fY5BLjYnCcz4PJ8kWfBStgtzTqsbgjsyjalttHP2MaYUQm0OH83gDEuQzNF2TpmiuFBno800uqeeZGTL');

dotenv.config()

connectDB()

// sk_test_51NIXdrSJv6spOPlPc1fY5BLjYnCcz4PJ8kWfBStgtzTqsbgjsyjalttHP2MaYUQm0OH83gDEuQzNF2TpmiuFBno800uqeeZGTL
// Pasta = > price_1NJJWzSJv6spOPlPjEtcYLEn

//initializing the express app
const app = express()  

app.use(cors())
app.use(express.json())   

app.use('/api/users', userRoutes)//completed
app.use('/api/restaurents', restaurentRoutes) //completed
app.use('/api/order', orderRoutes)
app.use('/api/tip', tipRoutes)

app.get('/api/temp', (req, res) => {
    res.status(200).send("api is running")
})   

app.get('/api/payment', asyncHandler(async (req, res) => {
    try {
        const restaurantId = req.query.restaurantId;
        const tableNumber = req.query.tableNumber;
    
        const restaurant = await Restaurant.findById(restaurantId);

        // console.log(restaurant)
    
        if (!restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
        }
    
        const orders = await Order.find({ restaurant_id: restaurantId, table_number: tableNumber, status: 'Delivered' });
        // console.log('helloo')
        console.log(orders)
        // Create an object to store the menu items and their quantities
        const menuItemsMap = new Map();
    
        // Iterate over the orders and update the menuItemsMap with the quantities
        orders.forEach(order => {
          order.menu_items.forEach(menuItem => {
            const { item_id, item_name, item_price, quantity, price } = menuItem;
            console.log(price)
    
            // If the menu item is already in the map, increase the quantity
            if (menuItemsMap.has(item_id.toString())) {
              const existingMenuItem = menuItemsMap.get(item_id.toString());
              existingMenuItem.quantity += quantity;
            } else {
              // Otherwise, add the menu item to the map
              menuItemsMap.set(item_id.toString(), {
                item_id,
                item_name,
                item_price,
                quantity,
                price
              });
            }
          });
        });
    
        // Convert the map values to an array
        const menuItems = Array.from(menuItemsMap.values());

        console.log('hi')
        console.log(menuItems)
    
        const tempid = "price_1NJJWzSJv6spOPlPjEtcYLEn"
    
        const menuItemsNew = menuItems.map(item => {
            return { price: item.price, quantity: item.quantity };
        });

        console.log(menuItemsNew)
    
        const session = await stripe.checkout.sessions.create({
          line_items: menuItemsNew,
          mode: 'payment',
          success_url: "http://localhost:3000/success",
          cancel_url: "http://localhost:3000/cancel"
      });

      await Order.updateMany({ restaurant_id: restaurantId, table_number: tableNumber, status: 'Delivered' }, { $set: { status: 'Completed' } });
    
      res.send(JSON.stringify({
          url: session.url
      }));
    
        // const menuItemsNew = menuItems.flatMap(order => {
        //   return order.menu_items.map(menuItem => {
        //     return { id: menuItem.item_id, quantity: menuItem.quantity };
        //   });
        // });
    
        // res.json(menuItemsNew);
      } catch (error) {
        res.status(500).json({ error: error });
      }
}))

console.log(`the port is ${process.env.PORT}`)

const port = process.env.PORT || 3000
console.log(port)

app.listen(port, console.log("app is running.."))