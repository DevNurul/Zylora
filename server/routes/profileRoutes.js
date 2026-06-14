const router           = require('express').Router()
const profile          = require('../controllers/profileController')
const authenticateUser = require('../middleware/authenticateUser')
const { profileUpload } = require('../middleware/uploadMiddleware')

router.use(authenticateUser)

router.get   ('/',                             profile.getProfile)
router.put   ('/',                             profile.updateProfile)

router.post  ('/addresses',                   profile.addAddress)
router.put   ('/addresses/:addressId',         profile.updateAddress)
router.delete('/addresses/:addressId',         profile.deleteAddress)
router.patch ('/addresses/:addressId/default', profile.setDefaultAddress)

router.post  ('/image', profileUpload,         profile.uploadProfileImage)
router.delete('/image',                        profile.deleteProfileImage)

module.exports = router
