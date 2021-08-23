import recipes from '../models/recipes.js'
import util from 'util'

export const newRecipe = async (req, res) => {
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const result = await recipes.create({
      name: req.body.name,
      type: req.body.type,
      video: req.body.video,
      description: req.body.description,
      servings: req.body.servings,
      time: req.body.time,
      instructions: JSON.parse(req.body.instructions),
      ingredients: JSON.parse(req.body.ingredients),
      image: req.filepath,
      author: req.user._id,
      classify: JSON.parse(req.body.classify)
    })
    req.user.recipes.push({ recipe: result._id })
    await req.user.save({ validateBeforeSave: false })
    res.status(200).send({ success: true, message: '食譜建立成功', result })
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

export const getRecipeById = async (req, res) => {
  try {
    const result = await recipes.findById(req.params.id).populate('comments.users', '_id account username avatar')
    res.status(200).send({ success: true, meesage: '', result })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400).send({ success: false, message: '查無這筆食譜' })
    }
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getRecipe = async (req, res) => {
  try {
    const query = {}
    // searchbar 篩選
    if (req.query.keywords) {
      if (!query.$or) {
        query.$or = []
      }
      const names = []
      const useraccount = []
      const username = []
      const ingredient = []
      const keywords = req.query.keywords.split(',')
      for (const keyword of keywords) {
        const re = new RegExp(keyword, 'i')
        names.push(re)
        useraccount.push(re)
        username.push(re)
        ingredient.push(re)
      }
      query.$or.push({ name: { $in: names } })
      query.$or.push({ 'author.account': { $in: useraccount } })
      query.$or.push({ 'author.username': { $in: username } })
      query.$or.push({ 'ingredients.ingredient': { $in: ingredient } })
    }
    // 食譜分類篩選
    if (req.query.chooses) {
      if (!query.$or) {
        query.$or = []
      }
      const classifys = []
      const chooses = req.query.chooses.split(',')
      for (const choose of chooses) {
        const re = new RegExp(choose, 'i')
        classifys.push(re)
      }
      query.$or.push({ classify: { $in: classifys } })
    }
    const sort = {}
    // 食譜排序
    if (req.query.sort === 'likes') {
      sort.likenum = -1
    } else {
      sort.publish_date = -1
    }
    const result = await recipes.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      }, {
        $lookup: {
          from: 'recipes',
          localField: 'author.recipes.recipe',
          foreignField: '_id',
          as: 'authorrecipes'
        }
      }, {
        $unwind: {
          path: '$author'
        }
      }, {
        $project: {
          image: 1,
          name: 1,
          likes: 1,
          type: 1,
          video: 1,
          ingredients: 1,
          servings: 1,
          time: 1,
          description: 1,
          instructions: 1,
          classify: 1,
          isEnabled: 1,
          publish_date: 1,
          likenum: {
            $size: '$likes'
          },
          'author._id': '$author._id',
          'author.username': '$author.username',
          'author.avatar': '$author.avatar',
          'author.account': '$author.account',
          'author.follower': {
            $size: '$author.follower'
          },
          'author.recipes': {
            $size: {
              $filter: {
                input: '$authorrecipes',
                cond: {
                  $eq: [
                    '$$this.isEnabled', 1
                  ]
                }
              }
            }
          }
        }
      }, {
        $match: query
      }, {
        $sort: sort
      }
    ])

    res.status(200).send({ success: true, meesage: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const editRecipe = async (req, res) => {
  const author = await recipes.findById(req.params.id, 'author')
  if (req.user.role === 0 && (req.user._id.toString() !== author.author._id.toString())) {
    res.status(403).send({ success: false, message: '沒有權限修改文章' })
    return
  }
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const data = {
      name: req.body.name,
      type: req.body.type,
      video: req.body.video,
      description: req.body.description,
      servings: req.body.servings,
      time: req.body.time,
      instructions: JSON.parse(req.body.instructions),
      ingredients: JSON.parse(req.body.ingredients),
      classify: JSON.parse(req.body.classify)
    }
    if (req.filepath) data.image = req.filepath
    const result = await recipes.findByIdAndUpdate(req.params.id, data, { new: true })
    res.status(200).send({ success: true, meesage: '食譜修改成功', result })
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

export const delRecipeById = async (req, res) => {
  const author = await recipes.findById(req.params.id, 'author')
  if ((req.user._id.toString() !== author.author._id.toString()) && req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限修改文章' })
    return
  }
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const data = {
      isEnabled: req.body.isEnabled
    }
    const result = await recipes.findByIdAndUpdate(req.params.id, data, { new: true })
    res.status(200).send({ success: true, meesage: '食譜已刪除', result })
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

export const postmsg = async (req, res) => {
  if (!req.user._id) {
    res.status(403).send({ success: false, message: '請登入後再進行操作' })
  }
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const recipe = await recipes.findById(req.params.id)
    const data = {
      users: req.body._id,
      content: req.body.content,
      date: Date.now(),
      isEnabled: 1
    }
    recipe.comments.push(data)
    await recipe.save({ validateBeforeSave: false })
    res.status(200).send({ success: true, meesage: '留言成功' })
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

export const editmsg = async (req, res) => {
  if (!req.user._id) {
    res.status(403).send({ success: false, message: '請登入後再進行操作' })
  }
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const recipe = await recipes.findById(req.params.id)
    const idx = recipe.comments.findIndex(item => item._id.toString() === req.body._id)
    if (req.body.isEnabled !== undefined) {
      recipe.comments[idx].isEnabled = req.body.isEnabled
    } else {
      recipe.comments[idx].content = req.body.content
    }
    await recipe.save({ validateBeforeSave: false })
    res.status(200).send({ success: true, meesage: '留言修改成功' })
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