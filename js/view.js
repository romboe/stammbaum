sb.menu = {
	settings: {
		personId: undefined,
		personId2: undefined,
		view: undefined
	},	
	id: 'sb-menu',
	ID_PAGESELECTION_PAGE2: 'sb-menu-pageselection-page2',
	page1: {
		id: 'sb-menu-page1',
		id_currentPerson: 'sb-menu-page1-currentPerson',
		id_search: 'sb-menu-page1-search',
		id_views: 'sb-menu-page1-views',
		currentPersonId: undefined,
		currentView: 'classic',	
		$page1: undefined,
		views: ['classic', 'googleorgchart', 'geschwister', 'cousins_cousinen'],
		selectView: function(view) {
			this.currentView = view;
			if (this.currentPersonId !== undefined) {
				this.showView();
			}
		},
		selectPerson: function(id) {
			sb.menu.settings.personId = id;
			this.currentPersonId = id;
			this.showCurrentPerson();
			sb.menu.personSelectedOnPage1();
			this.showView();			
		},	
		appendTo: function(parent) {
			parent.append('<div id="' + this.id + '"></div>');
			this.$page1 = $('#' + this.id);
			sb.view.facet.search.appendTo(this.$page1, this.id_search, 'sb.menu.page1.selectPerson');
			sb.view.facet.views.appendTo(this.$page1, this.id_views, this.views, 'sb.menu.page1.selectView');
			this.showCurrentPerson();
		},
		showCurrentPerson: function() {			
			var person = sb.model.findId(this.currentPersonId);
			if (undefined === person) {
				person = {firstname:'Bitte suchen', lastname:''};
			}
			$('#' + this.id_currentPerson).remove();
			sb.view.facet.currentPerson.appendTo(this.$page1, this.id_currentPerson, person);
		},
		showView: function() {
			var $main = $('#main');
			$main.empty();
			sb.view[this.currentView].appendTo($main, this.currentPersonId);
		}
	},
	page2: {
		id: 'sb-menu-page2',
		ID_CURRENTPERSON: 'sb-menu-page2-currentPerson',
		id_search: 'sb-menu-page2-search',
		id_views: 'sb-menu-page2-views',
		currentPersonId: undefined,
		currentView: 'relation',
		$page2: undefined,
		views: ['relation'],
		selectView: function(view) {
			this.currentView = view;
			if (this.currentPersonId !== undefined) {
				this.showView();
			}
		},
		selectPerson: function(id) {
			sb.menu.settings.personId2 = id;
			this.currentPersonId = id; 
			this.showCurrentPerson();
			this.showView();
		},
		showView: function() {
			var $main = $('#main');
			$main.empty();
			sb.view[this.currentView].appendTo($main, sb.menu.settings.personId, this.currentPersonId);
		},
		appendTo: function(parent) {
			parent.append('<div id="' + this.id + '"></div>');
			this.$page2 = $('#' + this.id);
			sb.view.facet.search.appendTo(this.$page2, this.id_search, 'sb.menu.page2.selectPerson');
			sb.view.facet.views.appendTo(this.$page2, this.id_views, this.views, 'sb.menu.page2.selectView');
			this.showCurrentPerson();
		},
		showCurrentPerson: function() {			
			var person = sb.model.findId(this.currentPersonId);
			if (undefined === person) {
				person = {firstname:'Bitte suchen', lastname:''};
			}
			$('#' + this.ID_CURRENTPERSON).remove();
			sb.view.facet.currentPerson.appendTo(this.$page2, this.ID_CURRENTPERSON, person);
		}
	},
	render: function(parent) {
		var pagecontainerid = this.id + '-pagecontainer';
		parent.append(
			'<div id="' + this.id + '-pageselection">'+
				'<div id="' + this.id + '-pageselection-page1">'+
				'<a href="#" onclick="$(\'#' + sb.menu.page2.id + '\').hide();$(\'#' + sb.menu.page1.id + '\').show();">Person 1</a><br/>'+
				'</div>'+
				'<div id="' + this.ID_PAGESELECTION_PAGE2 + '">Person 2</div>'+
			'</div>'+	
			'<div id="' + pagecontainerid + '">'+
				
				// this.page2.render()+	
			'</div>'
		);
		this.page1.appendTo($('#' + pagecontainerid));
		this.page2.appendTo($('#' + pagecontainerid));
		
		$('#' + sb.menu.page2.id).hide();
	},
	personSelectedOnPage1: function() {
		var div = $('#' + this.ID_PAGESELECTION_PAGE2); 
		div.empty();
		div.append(this.renderLinkToPage2());
	},
	renderLinkToPage2: function() {
		return '<a href="#" onclick="$(\'#' + sb.menu.page1.id + '\').hide();$(\'#' + sb.menu.page2.id + '\').show();">Person 2</a>';
	}
}

sb.view = {
	classic: {
		appendTo: function(parent, personId) {
			parent.append(this.render(personId));
			$('.sb-view-facet-datasheet01-image a').lightBox();
		},
		onSelectHandler: function(id) {
			sb.showView(this.render(id));
			$('.sb-view-facet-datasheet01-image a').lightBox();
		},
		render: function(personId) {	
			var viewid = "sb-view-classic";
			var h = "sb.view.classic.onSelectHandler";
			var result = '<div id="' + viewid + '">';
			
			var person = sb.model.findId(personId);
			result += sb.view.facet.datasheet01(viewid + '-person', person, h);			
			
			var father = sb.model.findId(person.father);		
			result += sb.view.facet.datasheet01(viewid + '-father', father, h);
			
			var ff = (father === undefined) ? undefined: sb.model.findId(father.father); 
			result += sb.view.facet.datasheet01(viewid + '-fatherfather', ff, h);
			var fm = (father === undefined) ? undefined: sb.model.findId(father.mother);
			result += sb.view.facet.datasheet01(viewid + '-fathermother', fm, h);
			
			var mother = sb.model.findId(person.mother)
			result += sb.view.facet.datasheet01(viewid + '-mother', mother, h);
			var mf = (father === undefined) ? undefined: sb.model.findId(mother.father);
			result += sb.view.facet.datasheet01(viewid + '-motherfather', mf, h);
			var mm = (father === undefined) ? undefined: sb.model.findId(mother.mother);
			result += sb.view.facet.datasheet01(viewid + '-mothermother', mm, h);
			
			result += '<div id="' + viewid + '-siblings">';
			
			var siblings = sb.model.findSiblings(person.id);
			
			result += sb.view.facet.list.render(siblings.sort(sb.model.helper.birthDescending), h, false);
			
			result += '</div>'
			
			result += '<div id="' + viewid + '-children">';
			var children = sb.model.findChildren(person.id, 1);
			result += sb.view.facet.list2.render('', children.sort(sb.model.helper.birthDescending), h);
			result += '</div>';
			
			result += '</div>';
			
			//$('#sb-view-classic').find('ich').get(0).draggable();
	//		$d.draggable();
			return result; 
		}
	},
	googleorgchart: {
		appendTo: function(parent, personId) {
			var data = new google.visualization.DataTable();
			data.addColumn('string', 'Name');
			data.addColumn('string', 'Manager');
			data.addColumn('string', 'ToolTip');
			var ds = sb.model.findDescendants(personId, 3);
			for (var i=0; i<ds.length; i++) {
				var d = ds[i];
				data.addRow([{v:'' + d.id, f:sb.view.facet.datasheet02('' + d.id, d, '')}, ''+d.parentRef, '']);	
			}
	  		var chart = new google.visualization.OrgChart(parent[0]);
	  		chart.draw(data, {allowHtml:true});
		}
	},
	geschwister: {
		appendTo: function(parent, personId) {
			parent.append(this.render(personId));
			$('.draggable').draggable();
		},
		render: function(personId) {
			var siblings = sb.model.findSiblings(personId);
			siblings.push(sb.model.findId(personId));
			siblings.sort(sb.model.helper.birthDescending);
			return sb.view.facet.pictureList.render('sb-view-geschwister', siblings);
		}
	},
	cousins_cousinen: {
		appendTo: function(parent, personId) {
			parent.append(this.render(personId));
			$('.draggable').draggable();
		},
		render: function(personId) {
			return sb.view.facet.pictureList.render('sb-view-cousins', sb.model.findCousins(personId));
		}
	},
	relation: {
		appendTo: function(parent, personId1, personId2) {
			parent.append(this.render(personId1, personId2));
			$('#sb-view-relation a').lightBox();
		},
		render: function(personId1, personId2) {
			var n = 0;
			var b = [];
			var viewid = "sb-view-relation";
			b[n++] = '<div id="' + viewid + '">';
			var path = sb.model.findRelation(personId1, personId2);
			if (path.length > 0) {
				var tree = sb.model.splitPathIntoLeftAndRight(path);
				tree.left.push(personId1);
			}
			b[n++] = this.renderBranches(tree.left, tree.right);
			b[n++] = '</div>'
			return b.join('');
		},
		renderBranches: function(left, right) {
			var n = 0;
			var b = [];
			if (left.length > 0) {
				var root = left.shift();
				var person = sb.model.findId(root);
				b[n++] = '<div id="sb-view-relation-root">';
				b[n++] = sb.view.facet.imageLink01(person);
				b[n++] = '</div>';
				if (right.length > 0) {
					b[n++] = '<div id="sb-view-relation-fork"></div>';
					b[n++] = this.renderBranch(left, 150, 'left', 'line-left');
					b[n++] = this.renderBranch(right, 150, 'right', 'line-right');
				}
				else {
					b[n++] = '<div class="line01 sb-view-relation-line-center" style="top:100px;"></div>';
					b[n++] = this.renderBranch(left, 125, 'center', 'line-center');
				}
			}
			return b.join('');
		},
		renderBranch: function(array, offset, imgStyle, lineStyle) {
			var result = '';
			var count = 0;
			while (array.length > 0) {
				var personId = array.shift();
				person = sb.model.findId(personId);
				
				var imageHeight = 80;
				var lineHeight = 25;
				var top = offset + count * (imageHeight + lineHeight);
				var lineTop = top + imageHeight;
				
				result += '<div class="sb-view-relation-' + imgStyle + '" style="top:' + top + 'px;">' + sb.view.facet.imageLink01(person) + '</div>';
				if (array.length > 0) {
					result += '<div class="line01 sb-view-relation-' + lineStyle + '" style="top:' + lineTop + 'px;"></div>';
				}
				
				count++;
			}
			return result;
		}
	}
}

sb.view.facet = {
	imagePath: sb.imagePath,	
		
	currentPerson: {
		appendTo: function(parent, id, person) {
			parent.append(this.render(id, person));
		},
		render: function(id, person) {			 		
			return '<div id="' + id + '" class="currentPerson">' + person.firstname + ' ' + person.lastname + '</div>';
		}
	},
	views: {
		appendTo: function(parent, id, views, callback) {
			parent.append(this.render(id, views, callback));
		},
		render: function(id, views, callback) {
			var a = '<div id="' + id + '" class="list-of-views"><ul>';
			for (var i=0; i<views.length; i++) {
				a += '<li>';
				a += '<a href="#" onclick="' + callback + '(\'' + views[i] + '\');return false;">' + views[i] + '</a>';
				a += '</li>';
			}
			a += '</ul></div>'
			return a;
		}
	},
	pictureList: {
		render: function(id, data) {
			var b = [];
			var n = 0;
			b[n++] = '<div id="' + id + '"><table><tr><td>';
			var parts = sb.helper.splitArrayIntoPartsOf(data, 6);
			for (var i=0; i<parts.length; i++) {
				var part = parts[i];
				b[n++] = '<table><tr>';
				for (var j=0; j<part.length; j++) {
					var src = sb.view.facet.buildFilePath(part[j]);
					b[n++] = bleistift.tagWithContent('td', {},
						bleistift.tagWithContent('div',{_class:'draggable'},
							bleistift.tag('img', {_class:'image02', src:src})
						)
					);
				}
				b[n++] = '</tr><tr>'
				for (var j=0; j<part.length; j++) {
					b[n++] = bleistift.tagWithContent('td', {}, part[j].firstname);
				}
				'</tr></table>';
			}
			b[n++] = '</td></tr></table><div>';
			return b.join('');
		}
	},
	list: {
		render: function(persons, onSelectHandler, renderWiki) {
			var n = 0;
			var b = [];
			b[n++] = '<ul class="sb-view-facet-list">';
			for (var i=0; i<persons.length; i++) {
				var person = persons[i];
				b[n++] = '<li>';
				b[n++] = renderWiki ? this.renderWiki(person) : '';
				b[n++] = '<a href="#" onclick="';
				b[n++] = onSelectHandler;
				b[n++] = '(';
				b[n++] = person.id;
				b[n++] = ');return false;">';
				b[n++] = person.lastname;
				b[n++] = ' ';
				b[n++] = person.firstname;
				b[n++] = '</a> ';
				b[n++] = sb.model.helper.buildDate(person.birth);
				b[n++] = '</li>'; 
			}
			b[n++] = '</ul>';
			return b.join('');
		},
		renderWiki: function(person) {
			var n = 0;
			var b = [];
			var urlPrefix = 'http://stammbaum.theconstant.at/mediawiki/index.php?title=';
			if (person.wiki) {
				b[n++] = '<a href="';
				b[n++] = urlPrefix;
				b[n++] = person.wiki
				b[n++] = '" target="_blank">W</a> ';
			}
			else {
				b[n++] = ' ';
			}
			return b.join('');
		}
	},
	list2: {
		render: function(id, items, onSelectHandler) {
			var result = '<ul class="sb-view-facet-list2">';
			for (var i=0; i<items.length; i++) {
				var item = items[i];
				result += '<li>'+
					'<a href="#" onclick="' + onSelectHandler + '(' + item.id + ');return false;">' + item.firstname + '</a> '+
					sb.model.helper.buildDate(item.birth) +
					'</li>'; 
			}
			result += '</ul>';
			return result;
		}		
	},
	search: {
		appendTo: function(parent, id, callback) {
			parent.append(this.render(id, callback));
			
			$('#' + id + ' input').on('keypress', function(e) {
				if (e.keyCode === 13) {
					$('#' + id + '-button').click();
				}
			});
		},
		buildCriteria: function(id) {
			var p = {};
			p.firstname = $('#' + id + '-firstname').val();
			p.lastname = $('#' + id + '-lastname').val();
			p.birth = this.fetchDate(id, 'birth');
			p.death = this.fetchDate(id, 'death');
			return p;
		},
		fetchDate: function(id, name) {
			var prefix = '#' + id + '-' + name + '-';
			var d = $(prefix + 'day').val();
			var m = $(prefix + 'month').val();
			var y = $(prefix + 'year').val();
			var date = {};
			date.d = ((d === '') || d.NaN) ? undefined : +d;
			date.m = ((m === '') || m.NaN) ? undefined : +m;
			date.y = ((y === '') || y.NaN) ? undefined : +y;
			return date;
		},
		find: function(id, onSelectHandler) {
			var result = sb.model.find(this.buildCriteria(id));			// 
			var $ul = $('#' + id + '-result');
			$ul.empty();
			$ul.append(sb.view.facet.list.render(result, onSelectHandler, true));
		},
		render: function(id, onSelectHandler) {
			return (
				'<div id="' + id + '" class="search">'+
					sb.view.facet.searchInput(id)+
					'<input id="' + id + '-button" type="button" onclick="sb.view.facet.search.find(\'' + id + '\',\'' + onSelectHandler + '\')" value="Suchen"/>'+ 
					'<div class="search-result" id="' + id + '-result"></div>'+
				'</div>'
			);
		}
	},
	searchInput: function(idprefix) {
		return (
			'<div>' +
				'<table>'+
					'<tr>'+
						'<td>Vorname</td>'+
						'<td>'+
							'<input class="sb-view-facet-searchInput-firstname" id="' + idprefix + '-firstname" type="text"/>'+
						'</td>'+
					'</tr>'+
					'<tr>'+
						'<td>Nachname</td>'+
						'<td>'+
							'<input class="sb-view-facet-searchInput-lastname" id="' + idprefix + '-lastname" type="text"/>'+
						'</td>'+
					'</tr>'+
					'<tr>'+
						'<td>geboren</td>'+
						'<td>'+
							this.dateinput(idprefix + '-birth')+
						'</td>'+
					'</tr>'+
					'<tr>'+
						'<td>gestorben</td>'+
						'<td>'+
							this.dateinput(idprefix + '-death')+
						'</td>'+
					'</tr>'+
				'</table>'+
			'</div>'	
		);
	},
	dateinput: function(idprefix) {
		return (
			'<table>'+
				'<tr>'+
					'<td>'+
						'<input class="sb-view-facet-dateinput-day" id="' + idprefix + '-day" size="2" type="text"/>'+
					'</td>'+
					'<td>'+
						'<input class="sb-view-facet-dateinput-month" id="' + idprefix + '-month" size="2" type="text"/>'+
					'</td>'+
					'<td>'+
						'<input class="sb-view-facet-dateinput-year" id="' + idprefix + '-year" size="2" type="text"/>'+
					'</td>'+
				'</tr>'+
			'</table>'
		);		
	},
	datasheet01: function(id, person, onSelectHandler) {
		var n = 0;
		var b = [];
		b[n++] = '<div class="sb-view-facet-datasheet01" id="' + id + '">';
		b[n++] = '<div class="sb-view-facet-datasheet01-image" id="' + id + '-img">';
		b[n++] = this.imageLink01(person); 
		b[n++] = '</div>';
		b[n++] = '<div class="sb-view-facet-datasheet01-facts">';
		b[n++] = this.facts01(person, onSelectHandler);
		b[n++] = '</div>';
		b[n++] = '</div>';
		return b.join('');
	},
	imageLink01: function(person) {
		if (person === undefined) {
			return '';
		}
		var src = this.buildFilePath(person);
		return bleistift.tagWithContent('a', {href:src},
			bleistift.tag('img',
				{_class:'image01',
				src:src,
				title:person.firstname + ' ' + person.lastname}));
	},
	buildFilePath: function(person) {
		var filename = sb.data.bild[person.uuid];
		return sb.view.facet.imagePath + filename;
	},
	datasheet02: function(id, person, onSelectHandler) {
		var b = [];
		var n = 0;
		var src = this.buildFilePath(person);
		b[n++] = '<div class="datasheet02" id="' + id + '">';
		b[n++] = bleistift.tag('img', {src:src,_class:'image01'});
		b[n++] = '<br>';
		b[n++] = '<div>' + person.firstname + ' ' + person.lastname + '</div></div>'
		return b.join('');
	},
	facts01: function(person, onSelectHandler) {		
		var result = '<table class="sb-view-facet-facts01">' + 
				'<tr>' + 
					'<td>';
		if (person !== undefined) {
			result += '<a href="#" onclick="' + onSelectHandler + '(' + person.id + ');return false;">' + person.firstname + '</a>';
		}
		result += '</td></tr>' +
				'<tr>' +
					'<td>';
		if (person !== undefined) {
			result += person.lastname;
		}
		result += '</td></tr>' +
				'<tr>' +
					'<td>';
				if (person !== undefined) {
					result += sb.model.helper.buildDate(person.birth);
				}
		result += '</td></tr>' +
				'<tr>' +
					'<td>';
				if (person !== undefined) {
					result += sb.model.helper.buildDate(person.death);
				}
		result += '</td></tr>' +
							
			'</table>';		
		
		return result;
	},	
	facts02: function(person, onSelectHandler) {		
		var result = '<table>' + 
				'<tr><td>Vorname</td>' + 
					'<td>';
		if (person !== undefined) {
			result += '<a href="#" onclick="' + onSelectHandler + '(' + person.id + ');return false;">' + person.firstname + '</a>';
		}
		result += '</td></tr>' +
				'<tr><td>Name</td>' +
					'<td>';
		if (person !== undefined) {
			result += person.lastname;
		}
		result += '</td></tr>' +					
			'</table>';		
		
		return result;
	}			
}
