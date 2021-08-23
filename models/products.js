import mongoose from 'mongoose'

const Schema = mongoose.Schema

const productSchema = new Schema({
  name: {
    type: String,
    minlength: [1,'商品名稱必須超過 1 個字以上'],
    maxlength: [20, '商品名稱不能超過 20 個字'],
    required: [true, '商品名稱不能為空'],
    unique: [true, '商品名稱不能重複']
  },
  price: {
    type: Number,
    min: [0, '價格格式不正確'],
    required: [true, '價格不能為空']
  },
  description: {
    type: String
  },
  image: {
    type: [String]
  },
  sell: {
    type: Boolean,
    default: false
  },
  shortcut: {
    type: String,
    required: [true, '簡述不能為空']
  },
  quantity: {
    type: Number,
    default: 0
  },
  discounttext: {
    type: String
  }
}, { versionKey: false })


export default mongoose.model('products', productSchema)