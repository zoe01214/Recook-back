import express from 'express'
import auth from '../middleware/auth.js'
import upload from '../middleware/upload.js'
import { newproduct, editproduct, getproduct, getproductById, getproductHome } from '../controllers/products.js'

const router = express.Router()

router.post('/', auth, upload, newproduct)
router.patch('/:id', auth, upload, editproduct)
router.get('/', getproduct)
router.get('/home', getproductHome)
router.get('/:id', getproductById)

export default router
