import mongoose from 'mongoose'
import md5 from 'md5'
import validator from 'validator'

const Schema = mongoose.Schema

const UserSchema = new Schema({
  account: {
    type: String,
    minlength: [4, '帳號必須超過 4 個字以上'],
    maxlength: [20, '帳號不能超過 20 個字'],
    required: [true, '帳號不能為空'],
    unique: true
  },
  password: {
    type: String,
    minlength: [4, '密碼必須超過 4 個字以上'],
    maxlength: [20, '密碼不能超過 20 個字'],
    required: [true, '密碼不能為空']
  },
  email: {
    type: String,
    required: [true, '信箱不能為空'],
    unique: true,
    validate: {
      validator: (email) => {
        return validator.isEmail(email)
      },
      message: '信箱格式不正確'
    }
  },
  isEnabled: {
    // 1 = 正常啟用
    // 0 = 封鎖狀態
    type: Number,
    default: true,
    required: [true, '沒有使用者帳戶狀態']
  },
  role: {
    // 0 = 一般會員
    // 1 = 管理員
    type: Number,
    default: 0,
    required: [true, '沒有使用者分類']
  },
  tokens: {
    type: [String]
  },
  cart: {
    type: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'products',
          required: [true, '缺少商品 ID']
        },
        amount: {
          type: Number,
          required: [true, '缺少商品數量']
        }
      }
    ]
  },
  avatar: {
    type: [String]
  },
  // 使用者分享的食譜
  recipes: {
    type: [
      {
        recipe: {
          type: Schema.Types.ObjectId,
          ref: 'recipes',
          required: [true, '缺少食譜 ID']
        }
      }
    ]
  },
  likes: {
    type: [
      {
        recipes: {
          type: Schema.Types.ObjectId,
          ref: 'recipes',
          required: [true, '缺少食譜 ID']
        }
      }
    ]
  },
  // 使用者收藏的食譜
  favorites: {
    type: [
      {
        recipes: {
          type: Schema.Types.ObjectId,
          ref: 'recipes',
          required: [true, '缺少食譜 ID']
        }
      }
    ]
  },
  // 追蹤 user 的人
  follower: {
    type: [
      {
        users: {
          type: Schema.Types.ObjectId,
          ref: 'users',
          required: [true, '缺少粉絲 ID']
        }
      }
    ]
  },
  // user 追蹤的人
  following: {
    type: [
      {
        users: {
          type: Schema.Types.ObjectId,
          ref: 'users',
          required: [true, '缺少追蹤者 ID']
        }
      }
    ]
  },
  username: {
    type: String,
    minlength: [1, '名稱最少 2 個字'],
    maxlength: [20, '名稱最多 20 個字']
  },
  profile: {
    type: String
  }
}, {versionKey: false })

UserSchema.pre('save', function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = md5(user.password)
  }
  next()
})

export default mongoose.model('users', UserSchema)