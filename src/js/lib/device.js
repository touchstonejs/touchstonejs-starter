var map = {
	'Android': /Android/,
	'iOS': /(iPad|iPhone)/
}

var userAgent = window.navigator.userAgent
var deviceType = 'Browser'

for (var key in map) {
	if (map[key].test(userAgent)) {
		deviceType = key
	}
}

module.exports = {
	platform: deviceType
}
