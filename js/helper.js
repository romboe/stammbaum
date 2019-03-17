sb.helper = {
	splitArrayIntoPartsOf: function(array, number) {
		if (array.length === 0) {
			return [[]];
		}
		var result = [];
		var part = [];
		for (var i=0; i<array.length; i++) {
			part.push(array[i]);
			if (((i+1) % number === 0) || (i == array.length-1)) {
				result.push(part);
				part = [];
			}
		}
		return result;
	},
	isMomentWithinNextDays: function(m, days) {
		if (!m.isValid()) {
			return false;
		}
		m.startOf('day');
		var future = new moment();
		future.startOf('day');
		future.add('days', days);
		// Year must be equal
		m.year(future.year());
		var diff = future.diff(m, 'days');
		return (diff >= 0) && (diff <= days); 
	}
}