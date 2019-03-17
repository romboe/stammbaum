bleistift = {
	tag: function(tagname, attributes) {
		var n = 0;
		var b = [];
		b[n++] = '<';
		b[n++] = tagname;
		b[n++] = ' ';
		b[n++] = this.renderAttributes(attributes);
		b[n++] = '/>';
		return b.join('');
	},
	tagWithContent: function(tagname, attributes, content) {
		var n = 0;
		var b = [];
		b[n++] = '<';
		b[n++] = tagname;
		b[n++] = ' ';
		b[n++] = this.renderAttributes(attributes);
		b[n++] = '>';
		b[n++] = content;
		b[n++] = '</';
		b[n++] = tagname;
		b[n++] = '>';
		return b.join('');
	},
	renderAttributes: function(attributes) {
		var n = 0;
		var b = [];
		for (var name in attributes) {
            b[n++] = (name.substring(0,1) === '_') ? name.substr(1) : name;
            b[n++] = '="';
            b[n++] = attributes[name];
            b[n++] = '" ';
        }
		return b.join('');
	}
}