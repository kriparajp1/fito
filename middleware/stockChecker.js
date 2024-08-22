const Cart = require('../models/cartModel');
const User=require("../models/usermodel")

const checkStockMiddleware = async (req, res, next) => {
    const user=await User.findOne({email:req.session.user}) 
  const cart = await Cart.findOne({user:user._id}).populate('items.productId');
  if (!cart) {
    return res.redirect('/cart');
  }

  const errors = [];

  cart.items.forEach((item) => {
    const product = item.productId;
    if (item.quantity > product.product_stock) {
      errors.push(`Not enough stock for ${product.product_name}. Available stock is ${product.product_stock}`);
    }
  });

  if (errors.length > 0) {
    console.log('error', errors);
    
    return res.redirect(`/cart?er=${errors}`);
  }

  next();
};

module.exports = checkStockMiddleware;