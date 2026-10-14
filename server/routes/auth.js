import express from 'express'
import { register, login, getMe, updateMe, verifyPassword, updatePassword } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import {
  registerValidation,
  loginValidation,
  verifyPasswordValidation,
  updatePasswordValidation,
  profileValidation,
} from '../middleware/validate.js'

const router = express.Router()

router.post('/register', registerValidation, register)
router.post('/login', loginValidation, login)
router.get('/me', protect, getMe)
router.put('/me', protect, profileValidation, updateMe)
router.post('/verify-password', protect, verifyPasswordValidation, verifyPassword)
router.post('/update-password', protect, updatePasswordValidation, updatePassword)

export default router
