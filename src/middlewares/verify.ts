import { Hono } from "hono"
import { jwt } from 'hono/jwt'
import type { JwtVariables } from "hono/jwt"

// Specify the variable types to infer the `c.get('jwtPayload')`:
type Variables = JwtVariables

const app = new Hono<{ Variables: Variables }>()

app.use('/auth/*', (c, next) => {
  const jwtMiddleware = jwt({
    secret: 'c.env.JWT_SECRET',
    alg: 'HS256',
  })
  return jwtMiddleware(c, next)
})

app.get('/auth/page', (c) => {
  return c.text('You are authorized')
})