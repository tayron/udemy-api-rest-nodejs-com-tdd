const passport = require('passport')
const passportJwt = require('passport-jwt')

const { Strategy, ExtractJwt } = passportJwt;

const TOKEN_SECRET = 'Segredo'

module.exports = (app) => {
  const params = {
    secretOrKey: TOKEN_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  }

  const strategy = new Strategy(params, (payload, done) => {
    app.services.user.findById(payload.id)
      .then(user => {
        if (user) done(null, user)
        else done(null, false)
      }).catch(err => done(err, false))
  })

  passport.use(strategy)

  return {
    authenticate: () => passport.authenticate('jwt', { session: false })
  }
}