import express from 'express'
import auth from '../middleware/auth.js'
import upload from '../middleware/upload.js'
import { register,
   login,
   logout,
   getuserinfo,
   getUserById,
   getuserAll,
   follow,
   like,
   favorite,
   editInfo,
   editUser,
   addCart,
   getCart,
   editCart,
   extend } from '../controllers/users.js'

const router = express.Router()

router.post('/', register)
router.post('/cart', auth, addCart)
router.get('/cart', auth, getCart)
router.patch('/cart', auth, editCart)
router.post('/login', login)
router.post('/extend', auth, extend)
router.delete('/logout', auth, logout)
router.patch('/info/:id', auth, upload, editInfo)
router.patch('/follow/:id', auth, follow)
router.patch('/like/:id', auth, like)
router.patch('/favorite/:id', auth, favorite)
router.patch('/:id', auth, editUser)
// 取得個人資料
router.get('/my', auth, getuserinfo)
// 管理員取得所有資料
router.get('/all', auth, getuserAll)
// 一般使用者取得他人資料
router.get('/:id', getUserById)

export default router
