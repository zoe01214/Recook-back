import users from '../models/users.js'
import jwt from 'jsonwebtoken'
import md5 from 'md5'
import recipes from '../models/recipes.js'
import products from '../models/products.js'

export const register = async (req, res) => {
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    await users.create(req.body)
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    console.log(error.code)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else if (error.name === 'MongoError' && error.code === 11000) {
      res.status(400).send({ success: false, message: '帳號已存在' })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const login = async (req, res) => {
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const user = await users.findOne({ account: req.body.account }, '').populate('cart.product')
    if (user) {
      if (user.password === md5(req.body.password)) {
        const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET, { expiresIn: '7 days' })
        user.tokens.push(token)
        user.save({ validateBeforeSave: false })
        res.status(200).send({
          success: true,
          message: '登入成功',
          token,
          email: user.email,
          account: user.account,
          role: user.role,
          _id: user._id,
          avatar: user.avatar[0],
          username: user.username,
          cart: user.cart
        })
      } else {
        res.status(400).send({ success: false, message: '密碼錯誤' })
      }
    } else {
      res.status(400).send({ success: false, message: '帳號錯誤' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token !== req.token)
    req.user.save({ validateBeforeSave: false })
    res.status(200).send({ success: true, message: req.user })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const editInfo = async (req, res) => {
  if ((req.user._id.toString() !== req.body._id.toString()) && req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限修改資料' })
  }
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const data = {
      username: req.body.newname,
      profile: req.body.newprofile
    }
    if (req.body.image === '' && req.body.delavatar) data.avatar = []
    if (req.filepath && req.body.image !== '') data.avatar = req.filepath
    const result = await users.findByIdAndUpdate(req.body._id, data, { new: true })
    res.status(200).send({ success: true, message: '成功修改', result })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const follow = async (req, res) => {
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    if (req.user._id.toString() !== req.body._id.toString()) {
      if (req.body.type === 'delfans') {
        // 移除粉絲程序
        const user = await users.findById(req.user._id, 'follower')
        const idx = user.follower.map(f => f.users).indexOf(req.body._id)
        if (idx !== -1) {
          await users.findByIdAndUpdate(
            req.user._id,
            {
              $pull: {
                follower: {
                  users: req.body._id
                }
              }
            }
          )
          await users.findByIdAndUpdate(
            req.body._id,
            {
              $pull: {
                following: {
                  users: req.user._id
                }
              }
            }
          )
          res.status(200).send({ success: true, message: '移除粉絲' })
        }
      } else {
        // 正常追蹤程序
        const user = await users.findById(req.user._id, 'following')
        const userFollow = await users.findById(req.body._id, 'follower')
        const idx = user.following.map(f => f.users).indexOf(req.body._id)
        if (idx !== -1) {
          await users.findByIdAndUpdate(
            req.user._id,
            {
              $pull: {
                following: {
                  users: req.body._id
                }
              }
            }
          )
          await users.findByIdAndUpdate(
            req.body._id,
            {
              $pull: {
                follower: {
                  users: req.user._id
                }
              }
            }
          )
          res.status(200).send({ success: true, message: '取消追蹤' })
        } else {
          // 尚未追蹤
          user.following.push({ users: req.body._id })
          userFollow.follower.push({ users: req.user._id })
          user.save({ validateBeforeSave: false })
          userFollow.save({ validateBeforeSave: false })
          res.status(200).send({ success: true, message: '加入追蹤' })
        }
      }
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const like = async (req, res) => {
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    // 檢查是不是已經喜歡
    const user = await users.findById(req.user._id, 'likes')
    const recipe = await recipes.findById(req.body._id, 'likes')
    const data = user.likes.map(l => l.recipes).includes(req.body._id)
    if (data === true) {
      await users.findByIdAndUpdate(
        req.user._id,
        {
          $pull: {
            likes: {
              recipes: req.body._id
            }
          }
        }
      )
      await recipes.findByIdAndUpdate(
        req.body._id,
        {
          $pull: {
            likes: {
              users: req.user._id
            }
          }
        }
      )
      res.status(200).send({ success: true, message: '取消喜歡' })
    } else {
      // 尚未喜歡
      user.likes.push({ recipes: req.body._id })
      recipe.likes.push({ users: req.user._id })
      user.save({ validateBeforeSave: false })
      recipe.save({ validateBeforeSave: false })
      res.status(200).send({ success: true, message: '加入喜歡' })
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const favorite = async (req, res) => {
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    // 檢查是不是已經收藏
    const user = await users.findById(req.user._id, 'favorites')
    const data = user.favorites.map(f => f.recipes).includes(req.body._id)
    if (data === true) {
      await users.findByIdAndUpdate(
        req.user._id,
        {
          $pull: {
            favorites: {
              recipes: req.body._id
            }
          }
        }
      )
      res.status(200).send({ success: true, message: '取消收藏' })
    } else {
      // 尚未 like
      user.favorites.push({ recipes: req.body._id })
      user.save({ validateBeforeSave: false })
      res.status(200).send({ success: true, message: '加入收藏' })
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const editUser = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限修改資料' })
  }
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const data = {
      account: req.body.account,
      email: req.body.email,
      username: req.body.username,
      isEnabled: req.body.isEnabled
    }
    const result = await users.findByIdAndUpdate(req.body._id, data, { new: true })
    res.status(200).send({ success: true, message: '成功修改', result })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const addCart = async (req, res) => {
  try {
    const result = await products.findById(req.body.product)
    if (!result || !result.sell) {
      res.status(404).send({ success: false, message: '資料不存在' })
      return
    }
    const idx = req.user.cart.findIndex(item => item.product.toString() === req.body.product)
    if (idx > -1) {
      req.user.cart[idx].amount += req.body.amount
    } else {
      req.user.cart.push({ product: req.body.product, amount: req.body.amount })
    }
    await req.user.save({ validateBeforeSave: false })
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getCart = async (req, res) => {
  try {
    const { cart } = await users.findById(req.user._id, 'cart').populate('cart.product')
    res.status(200).send({ success: true, message: '', result: cart })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const editCart = async (req, res) => {
  try {
    // 如果傳入的數量小於等於 0，刪除
    // 如果大於 0，修改數量
    if (req.body.amount <= 0) {
      await users.findOneAndUpdate(
        { '_id': req.user._id, 'cart.product': req.body.product },
        {
          $pull: {
            cart: {
              product: req.body.product
            }
          }
        }
      )
    } else {
      await users.findOneAndUpdate(
        // 找到 cart.product 裡符合傳入的商品 ID
        {
          'cart.product': req.body.product
        },
        // 將該筆改為傳入的數量，$ 代表符合查詢條件的索引
        {
          $set: {
            'cart.$.amount': req.body.amount
          }
        }
      )
    }
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const extend = async (req, res) => {
  try {
    console.log('extend')
    const idx = req.user.tokens.findIndex(token => req.token === token)
    const token = jwt.sign({ _id: req.user._id.toString() }, process.env.SECRET, { expiresIn: '7 days' })
    req.user.tokens[idx] = token
    // 標記陣列文字已修改過，不然不會更新
    req.user.markModified('tokens')
    req.user.save({ validateBeforeSave: false })
    res.status(200).send({ success: true, message: '', result: token })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getUserById = async (req, res) => {
  try {
    const result = await users.findById(req.params.id, 'account username avatar follower following recipes profile likes favorites').populate('favorites.recipes', 'name image isEnabled publish_date likes').populate('recipes.recipe', 'name image isEnabled publish_date likes').populate('follower.users', 'account username avatar').populate('following.users', 'account username avatar')
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    if (error.name === 'CastError') {
      res.status(400).send({ success: false, message: '查無使用者' })
    }
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}
export const getuserHome = async (req, res) => {
  try {
    const result = await users.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'follower.users',
          foreignField: '_id',
          as: 'follower'
        }
      }, {
        $project: {
          _id: 1,
          isEnabled: 1,
          account: 1,
          role: 1,
          avatar: 1,
          username: 1,
          recipenum: {
            $size: '$recipes'
          },
          followernum: {
            $size: '$follower'
          }
        }
      }, {
        $sort: {
          followernum: -1
        }
      }, {
        $limit: 18
      }
    ])
    result.filter(u => u.role !== 1)
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    if (error.name === 'CastError') {
      res.status(400).send({ success: false, message: '查無使用者' })
    }
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getuserinfo = async (req, res) => {
  try {
    res.status(200).send({
      success: true,
      message: '',
      result: { 
        account: req.user.account,
        role: req.user.role,
        email: req.user.email,
        _id: req.user._id,
        avatar: req.user.avatar[0],
        username: req.user.username,
        cart: req.user.cart
      }
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'CastError') {
      res.status(400).send({ success: false, message: '查無使用者' })
    }
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getuserAll = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限取得資料' })
  }
  try {
    const result = await users.find().populate('user').lean()
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}
