var express = require('express');
var app = express();

app.use(express.static('./www'));

var server = app.listen(process.env.PORT || 8000, function () {
	console.log('Local Server ready on port %d', server.address().port);
});
