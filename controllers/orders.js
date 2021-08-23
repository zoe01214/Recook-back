import orders from '../models/orders.js'

export const neworders = async (req, res) => {
  try {
    if (req.user.cart.length > 0) {
      await orders.create({
        user: req.user._id,
        products: req.user.cart,
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        credit: req.body.credit,
        date: new Date()
      })
      req.user.cart = []
      req.user.save({ validateBeforeSave: false })
    }
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const editorders = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限更改訂單' })
  }
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const data = {
      products: req.body.products,
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      credit: req.body.credit,
      state: req.body.state
    }
    const result = await orders.findByIdAndUpdate(req.params.id, data, { new: true })
    res.status(200).send({ success: true, message: '文章建立成功', result })
  } catch (error) {
    console.log(error.code)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else if (error.name === 'MongoError' && error.code === 11000) {
      res.status(400).send({ success: false, message: '檢舉已存在' })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const getorders = async (req, res) => {
  try {
    const result = await orders.find({ user: req.user._id }).populate('products.product')
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getallorders = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限取得訂單' })
    return
  }
  try {
    const result = await orders.find().populate('user', 'account').populate('products.product', 'name price').lean()
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}
