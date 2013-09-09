module.exports = function () {
	this.defaultEquals = true; // If we can't find a valid handler default to key==val behaviour (i.e. {'foo': 'bar'} tests that the key 'foo' is the value 'bar')
	this.silent = false; // Shut up if we cant find a suitable handler

	this.handlers = [];

	this.init = function() {
		this.addHandler(/^(.*?) ={1,2}$/, function(key, val, data) { // {'foo =': 'bar'} or {'foo ==': 'bar'}
			return (data[key] == val);
		});
		this.addHandler(/^(.*?) >$/, function(key, val, data) { // {'foo >': 'bar'}
			return (data[key] > val);
		});
		this.addHandler(/^(.*?) <$/, function(key, val, data) { // {'foo <': 'bar'}
			return (data[key] < val);
		});
		this.addHandler(/^(.*?) (?:>=|=>)$/, function(key, val, data) { // {'foo >=': 'bar'} (or '=>')
			return (data[key] >= val);
		});
		this.addHandler(/^(.*?) (?:<=|=<)$/, function(key, val, data) { // {'foo <=': 'bar'} or ('=<')
			return (data[key] <= val);
		});
	};

	this.addHandler = function(re, callback) {
		this.handlers.push([re, callback]);
	};

	this.exec = function(filter, data) {
		var out = {};
		for (var id in data) {
			var row = data[id];
			if (this.matches(filter, row)) {
				out[id] = row;
			}
		}
		return out;
	};

	this.matches = function(filter, data) {
		for (var key in filter) {
			var handled = false;
			for (var h in this.handlers) {
				var matches;
				if (matches = this.handlers[h][0].exec(key)) { // Use this handler
					handled = true;
					if (this.handlers[h][1](matches[1], filter[key], data)) {
						// console.log('OK');
					} else {
						return false;
					}
				}
			}
			if (!handled)
				if (this.defaultEquals) {
					if (data[key] != filter[key])
						return false;
				} else {
					if (!this.silent)
						console.warn('No filter matching incomming string "' + key + '". Defaulting to no-match');
					return false;
				}
		}
		return true;
	};

	this.init();
}
