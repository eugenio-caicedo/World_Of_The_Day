
'use strict'

const config = {
  ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 3000,
  PROXY_URI: process.env.PROXY_URI,
  SLACK_TOKEN: process.env.SLACK_TOKEN,
  CHANNEL: process.env.SLACK_CHANNEL,
  ICON_EMOJI: ':rocket:'
}

module.exports = (key) => {
  if (!key) return config

  return config[key]
}
