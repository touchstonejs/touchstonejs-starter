var EventEmitter = require('events').EventEmitter

var async = require('async')
var httpify = require('httpify')

function PeopleStore () {
	EventEmitter.call(this)

	// initialize internal cache
	var storage = this.cache = {
		people: []
	}
	var self = this

	// Dispatchers
	this.starQueue = async.queue((data, callback) => {
		var { id, starred } = data

		// update internal data
		self.cache.people
			.filter(person => person.id === id)
			.forEach(person => person.isStarred = starred)

		// emit events
		self.emit('people-updated', storage.people)

		callback()
	}, 1)

	this.refreshQueue = async.queue((_, callback) => {
		// update
		httpify({
			method: 'GET',
			url: 'https://randomuser.me/api?nat=au&results=10'
		}, function (err, res) {
			if (err) return callback(err)

			storage.people = res.body.results.map(p => p.user)
			
			// post process new data
			storage.people.forEach((person, i) => {
				person.id = i
				person.name.first = person.name.first[0].toUpperCase() + person.name.first.slice(1)
				person.name.last = person.name.last[0].toUpperCase() + person.name.last.slice(1)
				person.name.initials = person.name.first[0] + person.name.last[0]
				person.name.full = person.name.first + ' ' + person.name.last
				person.category = Math.random() > 0.5 ? 'A' : 'B'
				person.github = person.name.first.toLowerCase() + person.name.last.toLowerCase()
				person.picture = person.picture.medium
				person.twitter = '@' + person.name.first.toLowerCase() + (Math.random().toString(32).slice(2, 5))
			})

			// emit events
			self.emit('people-updated', storage.people)
			self.emit('refresh')

			callback(null, storage.people)
		})
	}, 1)

	// refresh immediately
	this.refresh()
}

Object.assign(PeopleStore.prototype, EventEmitter.prototype)

// Intents
PeopleStore.prototype.refresh = function (callback) {
	this.refreshQueue.push(null, callback)
}

PeopleStore.prototype.star = function ({ id }, starred, callback) {
	this.starQueue.push({ id, starred }, callback)
}

// Getters
PeopleStore.prototype.getPeople = function () { return this.cache.people }

module.exports = PeopleStore
