sb.model = {
	findId: function(id) {
		if (id !== undefined) {
			// primitive linear search
			for (var i=0; i<sb.data.people.length; i++) {
				var person = sb.data.people[i];
				if (person.id === id) {
					return person;
				}
			}
		}
		return undefined;
	},
	findBirthdayChilds: function(lookahead) {
		var result = [];
		for (var i=0; i<sb.data.people.length; i++) {
			var person = sb.data.people[i];
			if (person.birth != '') {
				var m = new moment(person.birth);
				// Correct Timezone for dates before 1970
				var inThisYear = new moment();
				inThisYear.month(m.month());
				inThisYear.date(m.date());
				if (sb.helper.isMomentWithinNextDays(inThisYear, lookahead)) {
					result.push(person);
				}
			}
		}
		return result;
	},
	find: function(criteria) {
		var result = [];
		// primitive linear search
		for (var i=0; i<sb.data.people.length; i++) {
			var person = sb.data.people[i];
			
			// positive filters: i.e. everything that is filtered is returned as search result (like gold)
			if (this.filterName(person.firstname, criteria.firstname) &&
				this.filterName(person.lastname, criteria.lastname) &&
				this.filterDate(person.birth, criteria.birth) &&
				this.filterDate(person.death, criteria.death) &&
				this.filterFatherOrMother(person.mother, person.father, criteria.parent) &&
				this.filterParent(person.mother, criteria.mother) &&
				this.filterParent(person.father, criteria.father) &&
				this.filterNot(person.id, criteria.blacklist)
			) {
				result.push(person);
			}
		}
		return result;
	},
	filterDate: function(date, criteria) {
		if (criteria !== undefined) {
			var a = sb.model.helper.splitDate(date);
			if ((criteria.d !== undefined) && (criteria.d !== a.d)) {
				return false;
			}
			if ((criteria.m !== undefined) && (criteria.m !== a.m)) {
				return false;
			}
			if ((criteria.y !== undefined) && (criteria.y !== a.y)) {
				return false;
			}
		}
		return true;
	},
	filterNot: function(id, blacklist) {
		if (blacklist !== undefined) {
			for (var i=0; i<blacklist.length; i++) {
				if (id === blacklist[i]) {
					return false;
				}
			}
		}
		return true;
	},
	filterName: function(a, criterion) {
		if ((a !== undefined) && (criterion !== undefined)) {
			return (a.toUpperCase().indexOf(criterion.toUpperCase()) !== -1);
		}
		return true;
	},
	filterFatherOrMother: function(father, mother, criterion) {
		if (criterion === undefined) {
			return true;
		}
		if ((father === criterion) || (mother === criterion)) {
			return true;
		}
		return false;
	},
	filterParent: function(parent, criterion) {
		if (criterion === undefined) {
			return true;
		}
		if (parent === criterion) {
			return true;
		}
		return false;
	},
	findFather: function(id, ntimes) {
		return this.findFatherIntern(id, 0, ntimes, undefined);
	},
	findFatherIntern: function(id, i, ntimes, result) {
		if ((i === ntimes) || (id === undefined)) {
			return result;
		}
		var person = this.findId(id);
		var father = this.findId(person.father)
		return this.findFatherIntern(person.father, ++i, ntimes, father);
	},
	findChildren: function(id, ntimes) {		
		return this.findChildrenIntern(id, 0, ntimes);
	},
	findChildrenIntern: function(id, i, ntimes) {
		if ((id === undefined) || (i === ntimes)) {
			return [];
		}
		var person = this.findId(id);
		var children = this.find({parent:person.id});
		if (i+1 === ntimes) {	
			return children;
		}
		var result = [];
		++i;
		for (var j=0; j<children.length; j++) {
			var child = children[j];			
			result = result.concat(this.findChildrenIntern(child.id, i, ntimes));			
		}
		return result;
	},
	findDescendants: function(id, ntimes) {
        return this.findDescendantsIntern(id, '', 0, ntimes, []);
	},
	findDescendantsIntern: function(id, parentRef, i, ntimes, data) {
        var person = this.findId(id);
        data = data.concat({id:person.id, uuid:person.uuid, firstname:person.firstname, lastname:person.lastname, parentRef:parentRef});
        if (i < ntimes) {
                ++i;
                var children = this.find({parent:person.id});
                children.sort(sb.model.helper.birthDescending);
                for (var j=0; j<children.length; j++) {
                        var child = children[j];
                        data = data.concat(this.findDescendantsIntern(child.id, person.id, i, ntimes, []));
                }
        }
        return data;
     }, 
	findCousins: function(id) {
		var person = this.findId(id);
		var parents = this.findSiblings(person.father);
		parents = parents.concat(this.findSiblings(person.mother));
		var result = [];
		for (var i=0; i<parents.length; i++) {
			result = result.concat(this.findChildren(parents[i].id,1).sort(sb.model.helper.birthDescending));
		}
		return result;
	},
	findSiblings: function(id) {
		var person = this.findId(id);
		if ((person.mother === undefined) || (person.father === undefined)) {
			return [];
		}
		return this.find({
			mother:person.mother,
			father:person.father,
			blacklist:[id]
		});
	},
	/**
	 * 
	 * @param id
	 * @param path - array of 'father' or 'mother' strings
	 * @returns
	 */
	findAlongThePath: function(id, path) {
		var result = [];
		var person = this.findId(id);				
		var direction = path.shift();
		result.push(person);
		if (direction !== undefined) {
			result = result.concat(this.findAlongThePath(person[direction], path));			
		}
		return result;
	},
	findRelation: function(id1, id2) {
		return this.findRelation2(id1, id2, [], 0, 10, []);
	},
	findRelation2: function(id, gesucht, path, currentDepth, depth, tabu) {
		if (depth === 0) {
			return [];
		}
		if (currentDepth > depth) {
			return [];
		}
		if (id === gesucht) {
			return [':'];
		}
		path = this.findInChildren(id, gesucht, path, depth+currentDepth, tabu);
		if (path.length > 0) {
			// gefunden!
			return path;
		}
		else {
			// dieser Zweig wurde erfolglos abgesucht und landet in der Tabuliste
			tabu.push(id);
		}
		var person = this.findId(id);
		// 2. Kinder des Vaters durchsuchen, mit sich selbst als Tabu = Geschwister durchsuchen
	    if (person.father !== undefined) {
	    	path = this.findRelation2(person.father, gesucht, path, currentDepth+1, depth, tabu);
	    	if (path.length > 0) {
	    		path = ["Vater:"+person.father].concat(path);
	    		return path;
	    	}
	    }
	    // 3. Kinder der Mutter durchsuchen
	    if (person.mother !== undefined) {
	    	path = this.findRelation2(person.mother, gesucht, path, currentDepth+1, depth, tabu);
	    	if (path.length > 0) {
	    		path = ["Mutter:"+person.mother].concat(path);
	    		return path;
	    	}
	    }
	    return [];
	},
	findInChildren: function(id, gesucht, path, depth, tabu) {
		if (depth === 0) {
			return [];
		}	
		// Suche meine Kinder
		var children = this.findChildren(id, 1);
		// Keine Kinder, kein Pfad
		if (children.length === 0) {
			return [];
		}
		for (var i=0; i<children.length; i++) {
			// Wenn das Kind in der Tabuliste steht, dann durchsuche es nicht nochmal
			var child = children[i];
			if ($.inArray(child.id, tabu) == -1) {
				var entry = "Kind:" + child.id;
		        path.push(entry);
		        if (child.id === gesucht) {
		        	return path;
		        }
		        var retval = this.findInChildren(child.id, gesucht, path, depth-1, tabu);
		        if (retval.length === 0) {
		        	// Dieses Kind hatte keinen Nachfahren mit der gesuchten id, also muss der Pfadeintrag wieder gelöscht werden
		          path.pop();
		        }
		        else {
		        	return path;
		        }
			}
		}
		// Alle Kinder durch, aber nichts gefunden
	    return [];
	},
	splitPathIntoLeftAndRight: function(path) {
		var left = [];
		var right = [];
		for (var i=0; i<path.length; i++) {
			var value = path[i];
			if ((value.indexOf('Vater') === 0) || (value.indexOf('Mutter') === 0)) {
				var id = +value.split(':')[1]; 
				left.push(id);
			}
			else if (value.indexOf('Kind') === 0) {
				var id = +value.split(':')[1];
				right.push(id);
			}
		}
		return {
			left: left.reverse(),
			right: right
		}
	},
	helper: {
		birthDescending: function(p1, p2) {
			if ((p1.birth === undefined) || (p2.birth === undefined)) {
				return 0;
			}
			var b1 = +p1.birth.replace(/\-/g,'');
			var b2 = +p2.birth.replace(/\-/g,'');
			
			if (b1 > b2) {
				return 1;
			}
			else if (b2 > b1) {
				return -1;
			}
			return 0;
		},
		birthdayAscending: function(p1, p2) {
			if ((p1.birth === undefined) || (p2.birth === undefined)) {
				return 0;
			}
			var today = new moment;
			var m1 = new moment(p1.birth).year(today.year());
			var m2 = new moment(p2.birth).year(today.year());
			return m1.diff(m2);
		},
		buildFilename: function(person) {
			if (person === undefined) {
				return '';
			}
			var prefix = person.id;
			if ((person.birth !== undefined) && (person.birth.length !== 0)) {
				prefix = person.birth.replace(/\-/g,'');
			}
			var lastname = person.lastname.replace(/ö/g,'oe');
			
			return prefix + lastname + person.firstname;
		},
		buildDate: function(date) {
			if (date.length === 0) {
				return '&nbsp;';
			}
			var months = ['Jan','Feb','Mar','Apr','Mai','Jun','Jul','Aug','Sept','Okt','Nov','Dez'];
			var d = date.split('-');
			
			var day = (d[2] === '00') ? ' ?' : d[2];
			var month = (d[1] === '00') ? '?  ' : months[d[1]-1];
			var year = (d[0] === '0000') ? '?' : d[0];
			
			var str = day + '.' + month + ' ' + year;
			return str.split(' ').join('&nbsp;');
		},
		splitDate: function(date) {
			if (date.length === 0) {
				return {d:-1,m:-1,y:-1};
			}
			var a = date.split('-');
			return {d:+a[2],m:+a[1],y:+a[0]};
		}
	}
}