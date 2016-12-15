'use strict'

let express     = require('express')
,   serveStatic = require('serve-static')
,   compression = require('compression')
,   path        = require('path')
,   app = express()

app.use(compression())

process.env.NODE_ENV = 'development'
process.env.PORT = 3000

app.get('/', (req, res, next) => {
  res.sendFile('index.html', { root: path.join(__dirname, '') })
})

app.get('/foobar', (req, res, next) => {
  res.sendFile('foobar.html', { root: path.join(__dirname, '') })
})

app.use(serveStatic(path.join(__dirname, 'dist')))

app.listen(process.env.PORT, () => {
  console.log('Example app listening on port ' + process.env.PORT)
})
