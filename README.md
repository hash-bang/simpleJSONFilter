SimpleJSONFilter
================
Extremely simple, yet configurable, JSON filtering system.

This module provides an object aimed at filtering arrays (or hashes) of hashes.

The need for it is based on wanting an [ActiveRecord](http://ellislab.com/codeigniter/user-guide/database/active_record.html) like 'where' condition using only JSON arrays-of-hashes or hashes-of-hashes.

It can be thought of as an extremely dumbed down and easy to understand RegExp group capture operation.


Examples
========
Assume the following data structure in all examples:

	var data = {
		one: {
			id: 1,
			name: 'Hiro Protagonist',
			age: 27
		},
		two: {
			id: 2,
			name: 'Y.T.',
			age: 16
		},
		three: {
			id: 3,
			name: 'Raven',
			age: 40,
		},
		four: {
			id: 4,
			name: 'Uncle Enzo',
			age: 80
		},
		five: {
			id: 5,
			name: 'Fisheye',
			age: 50
		}
	};


Example of very simple `key=val` filtering

	var simpleJSONFilter = require("./index.js");
	var sjf = new simpleJSONFilter();
	var filter = {id: 1};
	var result = sjf.exec(filter, data); // Returns {one: {id: 1,name: 'Hiro Protagonist',age: 27}}

Example of complex filtering with conditionals

	var simpleJSONFilter = require("./index.js");
	var sjf = new simpleJSONFilter();
	var filter = {'age > 40'};
	var result = sjf.exec(filter, data); // Returns the keys & values of 'three', 'four' and 'five'

Definining your own handlers

	var simpleJSONFilter = require("./index.js");
	var sjf = new simpleJSONFilter();
	sjf.addHandler(/^(.*) ends with$/, function(key, val, data) {
		var str = data[key] + '';
		return (str.substr(str.length - val.length) == val);
	});

	var filter = {'age ends with': '0'};
	sjf.exec(filter, data), // Returns the keys & values of 'three', 'four' and 'five'

Alternate syntax

	var simpleJSONFilter = require("./index.js");
	var sjf = new simpleJSONFilter();
	sjf
		.filter({'age <=': '40'})
		.data(data)
		.exec(); // Returns keys & values of 'one', 'two' and 'three'

Limit the number of returned items

	var simpleJSONFilter = require("./index.js");
	var sjf = new simpleJSONFilter();
	sjf
		.filter({'age <=': '40'})
		.data(data)
		.limit(1)
		.exec(); // Returns keys & values of 'one' (as it has a limit of one)

Limit the number of returned items & return an array

	var simpleJSONFilter = require("./index.js");
	var sjf = new simpleJSONFilter();
	sjf
		.filter({'age <=': '40'})
		.data(data)
		.limit(1)
		.wantArray()
		.exec(); // Returns a single item array of 'one'
