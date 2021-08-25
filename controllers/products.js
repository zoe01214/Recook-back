import products from '../models/products.js'

export const newproduct = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限建立商品' })
  }
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const result = await products.create({
      name: req.body.name,
      price: req.body.price,
      image: req.filepath,
      description: req.body.description,
      sell: req.body.sell,
      shortcut: req.body.shortcut,
      quantity: req.body.quantity,
      discounttext: req.body.discounttext
    })
    res.status(200).send({ success: true, message: '商品建立成功', result })
  } catch (error) {
    console.log(error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else if (error.name === 'MongoError' && error.code === 11000) {
      res.status(400).send({ success: false, message: '商品已存在' })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const editproduct = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限更改商品' })
  }
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const data = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      sell: req.body.sell,
      shortcut: req.body.shortcut,
      quantity: req.body.quantity,
      discounttext: req.body.discounttext
    }
    if (req.filepath.length !== 0) {
      data.image = req.filepath
    }
    const result = await products.findByIdAndUpdate(req.params.id, data, { new: true })
    res.status(200).send({ success: true, message: '商品修改成功', result })
  } catch (error) {
    console.log(error.code)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else if (error.name === 'MongoError' && error.code === 11000) {
      res.status(400).send({ success: false, message: '商品已存在' })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const delImage = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限更改商品' })
  }
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const data = {
      image: []
    }
    const result = await products.findByIdAndUpdate(req.params.id, data, { new: true })
    res.status(200).send({ success: true, message: '商品修改成功', result })
  } catch (error) {
    console.log(error.code)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else if (error.name === 'MongoError' && error.code === 11000) {
      res.status(400).send({ success: false, message: '商品已存在' })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const getproduct = async (req, res) => {
  try {
    const result = await products.find()
    result.filter(p => p.sell === true)
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getproductHome = async (req, res) => {
  try {
    const result = await products.aggregate([{
      $limit: 10
    }])
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getproductById = async (req, res) => {
  try {
    const result = await products.findById(req.params.id)
    res.status(200).send({ success: true, meesage: '', result })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400).send({ success: false, message: '查無這筆商品' })
    }
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}
