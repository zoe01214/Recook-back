import mongoose from 'mongoose'

const Schema = mongoose.Schema

const recipeSchema = new Schema({
  name: {
    type: String,
    minlength: [5, '食譜名稱必須超過 5 個字以上'],
    maxlength: [20, '食譜名稱不能超過 20 個字'],
    required: [true, '食譜名稱不能為空']
  },
  type: {
    type: String,
    enum: ['text', 'video'],
    required: [true, '缺少食譜類型']
  },
  image: {
    type: [String],
    required: [true, '請至少上傳 1 張食譜圖片']
  },
  video: {
    // 影片食譜 url youtube連結
    type: String
  },
  description: {
    type: String,
    minlength: [10, '食譜描述至少 10 個字以上'],
    maxlength: [400, '食譜描述最多 400 個字'],
    required: [true, '請為食譜加上食譜簡介或料理訣竅等等']
  },
  servings: {
    // 份量(人數)
    type: String,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '15+'],
    required: [true, '缺少食譜份量']
  },
  time: {
    // 料理時間(分鐘)
    // 5 ~ 180+
    type: String,
    enum:['5', '10', '15', '20', '30', '40', '50', '60', '90', '120', '180+'],
    required: [true, '缺少料理時間']
  },
  likes: {
    // 按讚
    type: [
      {
        users: {
          type: Schema.Types.ObjectId,
          ref: 'users',
          required: [true, '缺少按讚人 ID']
        }
      }
    ]
  },
  rating: {
    type: [
      {
        users: {
          type: Schema.Types.ObjectId,
          ref: 'users',
          required: [true, '缺少評分人 ID']
        },
        ratingValue: {
          // 個人評分值
          type: Number
        }
      }
    ]
  },
  ingredients: {
    type: [
      {
        ingredient: {
          // 食材名稱
          type: String,
          maxlength: [15, '食材 15 字以內'],
          required: [true, '缺少食材名稱']
        },
        portion: {
          // 食材份量
          // 一匙、400克、適量
          type: String,
          maxlength: [15, '食材 10 字以內'],
          required: [true, '缺少食材份量']
        }
      }
    ]
  },
  instructions: {
    // 食譜步驟
    type: [String],
    minlength: [10, '步驟說明至少 10 個字以上'],
    maxlength: [100, '步驟說明最多 200 個字'],
    required: [true, '缺少料理步驟說明']
  },
  comments: {
    type: [
      {
        users: {
          type: Schema.Types.ObjectId,
          ref: 'users',
          required: [true, '缺少留言者 ID']
        },
        content: {
          type: String,
          maxlength: [200, '食譜評論最多 200 個字'],
          required: [true, '缺少留言內容']
        },
        date: {
          type: Date,
          required: [true, '缺少留言日期']
        },
        isEnabled: {
          type: Number,
          default: 1,
          required: [true, '缺少留言發布狀態']
        }
      }
    ]
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: [true, '缺少作者 ID']
  },
  publish_date: {
    type: Date,
    default: Date.now
  },
  isEnabled: {
    // 1 = 發佈狀態
    // 0 = 刪除狀態
    type: Number,
    default: 1,
    required: [true, '缺少食譜啟用狀態']
  },
  classify: {
    type: [String],
    required: [true, '缺少食譜分類']
  }
}, { versionKey: false })

export default mongoose.model('recipes', recipeSchema)
