bday = {}
bday.view = {
	today: {
		appendTo: function(parent, id) {
			parent.append(this.render(id));
		},
		render: function(id) {
			var list = bday.view.facet.list.render(id + 'list', 0);
			return bleistift.tagWithContent('div', {_id:id}, list);
		}
	},
	week: {
		appendTo: function(parent, id) {
			parent.append(this.render(id));
		},
		render: function(id) {
			var list = bday.view.facet.list.render(id + 'list', 7);
			return bleistift.tagWithContent('div', {_id:id}, list);
		}
	}
}
bday.view.facet = {
	list: {
		render: function(id, lookahead) {
			var b = [];
			var n = 0;
			var ps = sb.model.findBirthdayChilds(lookahead);
			ps.sort(sb.model.helper.birthdayAscending);
			b[n++] = bleistift.tag('ul', {_id:id});
			for (var i=0; i<ps.length; i++) {
				var p = ps[i];
				b[n++] = bday.view.facet.item.render(p);
			}
			b[n++] = '</ul>';
			return b.join('');
		}
	},
	item: {
		render: function(person) {
			return bleistift.tagWithContent('li', {}, person.firstname + ' ' + person.lastname + ' ' + sb.model.helper.buildDate(person.birth)); 
		}
	}
}