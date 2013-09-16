module.exports = function () {
	this.defaultEquals = true; // If we can't find a valid handler default to key==val behaviour (i.e. {'foo': 'bar'} tests that the key 'foo' is the value 'bar')
	this.silent = false; // Shut up if we cant find a suitable handler

	this.handlers = [];

	this.myFilter = null;
	this.myData = null;
	this.myLimit = null;
	this.myWantArray = false;

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

	// Simple setters {{{
	this.filter = function(filter) {
		this.myFilter = filter;
		return this;
	};

	this.data = function(data) {
		this.myData = data;
		return this;
	};

	this.limit = function(limit) {
		this.myLimit = limit;
		return this;
	};

	this.wantArray = function(wantArray) {
		this.myWantArray = wantArray === undefined ? true : wantArray;
		return this;
	};
	// }}}

	this.reset = function() {
		this.myData = null;
		this.myFilter = null;
		this.myWantArray = false;
		this.myLimit = 0;
		return this;
	};

	this.addHandler = function(re, callback) {
		this.handlers.push([re, callback]);
	};

	this.exec = function(filter, data, limit) {
		var out = this.myWantArray ? [] : {};
		var found = 0;
		if (!filter)
			filter = this.myFilter;
		if (!data)
			data = this.myData;
		if (!limit)
			limit = this.myLimit;

		for (var id in data) {
			var row = data[id];
			if (this.matches(filter, row)) {
				if (this.myWantArray) {
					out.push(row);
				} else
					out[id] = row;

				if (limit && ++found >= limit)
					break;
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
