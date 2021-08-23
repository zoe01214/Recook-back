import express from 'express'
import auth from '../middleware/auth.js'
import upload from '../middleware/upload.js'
import { newposts, getposts, editposts, getpostsById } from '../controllers/posts.js'

const router = express.Router()

router.post('/', auth, upload, newposts)
router.patch('/:id', auth, upload, editposts)
router.get('/', getposts)
router.get('/:id', getpostsById)

export default router
