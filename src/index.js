import 'autotrack/lib/plugins/clean-url-tracker'
import 'autotrack/lib/plugins/outbound-link-tracker'
import 'autotrack/lib/plugins/url-change-tracker'

ga('create', 'UA-XXXXXXXX-1', 'auto')
ga('require', 'cleanUrlTracker')
ga('require', 'outboundLinkTracker')
ga('require', 'urlChangeTracker')

ga('send', {
  hitType: 'pageview',
  page: '/',
  location: window.location.origin + '/',
  title: 'Root'
})
