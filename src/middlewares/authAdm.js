module.exports = function admAuthentication(req, res, next) {
    const { type } = req.userData
    if (type > 1) {
        return res.status(403).json({ error: 'user is not an administrator' })
    }
    return next()
}