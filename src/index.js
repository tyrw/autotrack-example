import 'autotrack'
// import './analytics.js'
ga('create', 'UA-XXXXXXXX-1', 'auto')

console.log(window.ga)

ga('send', {
  hitType: 'pageview',
  page: '/',
  location: window.location.origin + '/',
  title: 'Root'
})
