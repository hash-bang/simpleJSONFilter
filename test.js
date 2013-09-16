var simpleJSONFilter = require("./index.js");
var sjf = new simpleJSONFilter();
var assert = require("assert");

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

// Key == val test {{{
assert.deepEqual(
	sjf.exec({id: 1}, data),
	{one: data.one}
);
assert.deepEqual(
	sjf.exec({age: 50}, data),
	{five: data.five}
);
// }}}

// Turn off key == val {{{
sjf.defaultEquals = false;
sjf.silent = true;
assert.deepEqual(
	sjf.exec({id: 1}, data),
	{}
);
assert.deepEqual(
	sjf.exec({age: 50}, data),
	{}
);
// }}}

// Simple tests {{{
assert.deepEqual(
	sjf.exec({'id =': 2}, data),
	{two: data.two}
);

assert.deepEqual(
	sjf.exec({'age >': '40.1'}, data),
	{four: data.four, five: data.five}
);

assert.deepEqual(
	sjf.exec({'age >=': 40}, data),
	{three: data.three, four: data.four, five: data.five}
);

assert.deepEqual(
	sjf.exec({'age <': 40}, data),
	{one: data.one, two: data.two}
);

assert.deepEqual(
	sjf.exec({'age <=': '40'}, data),
	{one: data.one, two: data.two, three: data.three}
);
// }}}

// Alternate syntax {{{
assert.deepEqual(
	sjf
		.filter({'age <=': '40'})
		.data(data)
		.exec(),
	{one: data.one, two: data.two, three: data.three}
);
// }}}

// Multiple key tests {{{
assert.deepEqual(
	sjf.exec({'age >': '40.1', 'id >': 4}, data),
	{five: data.five}
);
assert.deepEqual(
	sjf.exec({'age >': '40.1', 'id >': 6}, data),
	{}
);
// }}}

// Limit {{{
assert.deepEqual(
	sjf
		.filter({'age <=': '40'})
		.data(data)
		.limit(1)
		.exec(),
	{one: data.one}
);
sjf.reset();
// }}}

// WantArray {{{
assert.deepEqual(
	sjf
		.filter({'age <=': '40'})
		.data(data)
		.limit(1)
		.wantArray()
		.exec(),
	[data.one]
);
sjf.reset();
// }}}

// Custom handler definition {{{
sjf.addHandler(/^(.*) ends with$/, function(key, val, data) {
	var str = data[key] + '';
	return (str.substr(str.length - val.length) == val);
});
assert.deepEqual(
	sjf.exec({'age ends with': '0'}, data),
	{three: data.three, four: data.four, five: data.five}
);
// }}}

// Compled handler definition {{{
// Determine if prime number. Algroythm happily stolen from http://stackoverflow.com/questions/11966520/how-to-find-prime-numbers/11967564#11967564
// NOTE: Ignores '1' as a prime
sjf.addHandler(/^(.*) is prime$/, function(key, val, data) {
	var n = parseInt(data[key]);
	if (n < 2) return false;

	// An integer is prime if it is not divisible by any prime less than or equal to its square root
	var q = parseInt(Math.sqrt(n));
	for (var i = 2; i <= q; i++) {
		if (n % i == 0) {
			return false;
		}
	}

	return true;
});
assert.deepEqual(
	sjf.exec({'id is prime': ''}, data),
	{two: data.two, three: data.three, five: data.five}
);
// }}}

console.log('OK!');
