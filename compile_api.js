/*
var source = system.stdin.read();

var tokens = [
	//"END",
	
	"ATNOTE"
];
var constSource = 'var'; // const trick is broken in narwhal
for ( var i = 0; i<tokens.length; i++ ) {
	constSource += ' ' + tokens[i] + ' = ' + (i+1) + ',';
}
constSource = constSource.substr(0, constSource.length-1) + ';';
eval(constSource);

function Tokenizer(s, f, l) {
	this.cursor = 0;
	this.source = s;
    this.tokens = [];
    this.tokenIndex = 0;
    this.filename = f || "";
    this.lineno = l || 1;
    this.indent = [];
}

Tokenizer.prototype = {
	
	get: function() {
		var token = {};
		var input = this.source.substr(this.cursor);
		
		if((match = /^@(\w+)/(input))) {
			var id = match[0];
			token.type = ATNOTE;
			token.value = id;
		} else {
			throw this.newSyntaxError("Invalid token");
		}
		
		this.cursor += match[0].length
		
		return token;
	},
	
    newSyntaxError: function (m) {
        var e = new SyntaxError(m, this.filename, this.lineno);
        e.source = this.source;
        e.cursor = this.cursor;
        return e;
    }

};

function Context() {
	
}

function Api(t, x) {
	this.tokenizer = t;
	this.context = x;
}
Api.prototype = {
	toString: function() {
		var s = '{\n';
		for ( var k in this ) if( this.hasOwnProperty(k) ) {
			s += '	' + k + ': ' + this[k] + '\n';
		}
		s += '}\n';
		return s;
	}
};

function parse(s, f, l) {
	var t = new Tokenizer(s, f, l);
	var x = new Context();
	var n = new Api(t, x);
	return n;
}

system.stdout.write(parse(source).toString());
*/


String.prototype.scan = function(regex, offset) {
	var m, list = [];
	if( regex.global ) {
		if( offset ) regex.lastIndex = offset;
		while( m = regex(this) )
			list.push( m.length > 1 ? m.slice(1) : m[0] );
	} else {
		offset = offset || 0;
		while( m = this.substr(offset).match(regex) ) {
			offset += m.index + m[0].length;
			list.push( m.length > 1 ? m.slice(1) : m[0] );
		}
	}
	return list;
};



var tokens = ["", // Skip 0
	"DOC", // Documentation root
	"MODULE", // Module root
	"CLASS", // Class root
	
	"DESCRIPTION", // Description blocks
	"PROP", // Property definition block (ie: methods, calls, properties, etc... anything we're documenting)
	"SOURCE", // Source code block
	
	"LINE" // Textual lines
];

var TOK = {};
for ( var t in tokens ) TOK[tokens[t]] = parseInt(t, 10);

function Node(doc, t) {
	if( typeof t == 'number' ) {
		this.type = t;
	} else {
		this.type = t.type;
	}
	if( !this.type || !tokens[this.type] ) throw new TypeError("Type not defined when creating node");
	if( this.type == TOK.PROP ) {
		this.args = {};
		this.calls = [];
		//this.arguments = [];
	}
	this.doc = doc;
	this.length = 0;
}
Node.prototype = {
	
	push: [].push,
	
	// For TOK.PROP
	addArgument: function(name, options) {
		if( this.type !== TOK.PROP ) throw TypeError("addArgument is only relevant to a PROP type node");
		
		options = options || {};
		options.name = name;
		options.text = options.text || '';
		if(!options.optionalBlock) options.optionalBlock = { open: false, close: false }
		
		this.calls[this.calls.length-1].arguments.push(options);
		this.args[name] = options;
		
		return options;
	},
	
	/*toString: function(indent) {
		indent = indent || [];
		var s = '{\n'
		indent.push('	');
		
		s += indent.join('') + 'type: ' + tokens[this.type] + '\n';
		
		if( this.args )
			s += indent.join('') + 'args: ' + toS(this.args, Object, indent.slice(), 1) + '\n';
		
		if( this.calls )
			s += indent.join('') + 'calls: ' + toS(this.calls, Array, indent.slice(), 3) + '\n';
		
		for ( var k in this )
			if( this.hasOwnProperty(k) && !/^(type|length|args|calls)$/(k) && !/^\d+$/.test(k) )
				s += indent.join('') + k + ': ' + ( this[k] instanceof Node ? this[k].toString(indent.slice()) : this[k] ) + '\n';
		
		if( this.length ) s += indent.join('') + 'length: ' + this.length + '\n';
		for ( var k = 0; k < this.length; k++ )
				s += indent.join('') + k + ': ' + ( this[k] instanceof Node ? this[k].toString(indent.slice()) : this[k] ) + '\n';
		
		indent.pop();
		s += indent.join('') + '}\n';
		return s;
	},*/
	
	getJSON: function() {
		if(this.type !== TOK.CLASS) throw "getJSON is only implemented for Classes";
		var json = {
			ROOT: config.root,
			module: this.module.name || ""
		};
		
		json['class'] = this.name;
		if( this.description ) json.description = this.description.getHTML();
		if( this.props && this.props.length ) {
			json.props = [];
			for ( var j = 0; j < this.props.length; j++ ) {
				var prop = this.props[j];
				var p = {};
				var k, a = 'readonly,alias,debate,nameTBD,TBD'.split(',');
				while( k = a.shift() ) p[k] = prop[k];
				p.arguments = [];
				for ( k in prop.args ) if( prop.args[k].text ) p.arguments.push( prop.args[k] );
				p.body = prop.getHTML();
				
				if( prop.calls && prop.calls.length ) {
					p.calls = [];
			
					for ( var z = 0; z < prop.calls.length; z++ ) {
						var call = prop.calls[z];
						var q = {};
						var k, a = 'id,name,on,instanced,construct,namedProp,func,set'.split(',');
						while( k = a.shift() ) q[k] = call[k];
						q.callname = '';
						if(q.construct) q.callname += 'new ';
						if(q.on) q.callname += q.on + '.';
						if(q.name) q.callname += q.name;
						if(q.namedProp) q.callname += '[]';
						if(q.func) q.callname += '()';
						if(q.set) q.callname += '=';
						q.callhtml = '';
						if(q.construct) q.callhtml += '<span class="kwd new">new</span> ';
						if(q.on) q.callhtml += '<span class="' + ( q.instanced ? 'pln' : 'typ' ) + '">' + q.on + '</span><span class="pun dot">.</span>';
						if(q.name) q.callhtml += '<span class="pln">' + q.name + '</span>';
						if(q.namedProp) q.callhtml += '<span class="pun bracket">[</span>';
						if(q.func) q.callhtml += '<span class="pun paren">(</span>';
						if(q.set) q.callhtml += ' <span class="pun eq">=</span> ';
						//if(q.type !== 'get')
							for ( var a = 0; a<call.arguments.length; a++ ) {
								var arg = call.arguments[a];
								if(a>0) q.callhtml += '<span class="pun comma">,</span> ';
								if(arg.optionalBlock.open) q.callhtml += '<span class="pun optbracket">[</span>';
								var className = ['pln'];
								if( arg.optional ) className.push('optional');
								var ident = arg.name;
								switch(arg.name) {
								case '...':
									className.shift();
									ident = '&hellip;';
									break;
								case 'true':
								case 'false':
								case 'undefined':
								case 'null':
								case 'Infinity':
								case 'NaN':
									className.shift();
									className.unshift('kwd');
									break;
								}
								q.callhtml += '<span class="' + className.join(' ') + '">' + ident + '</span>';
								if(arg.defaultValue) q.callhtml += '<span class="pun eq">=</span>' + arg.defaultValue;
								if(arg.optionalBlock.close) q.callhtml += '<span class="pun optbracket">]</span>';
							}
						if(q.func) q.callhtml += '<span class="pun paren">)</span>';
						if(q.namedProp) q.callhtml += '<span class="pun bracket">]</span>';
						q.callhtml += '<span class="pun semi">;</span>';
						p.calls.push(q);
					}
			
				}
				
				json.props.push(p);
			}
			
		}
		
		return json;
	},
	
	getText: function() {
		var text = [];
		for ( var l = 0; l<this.length; l++ ) {
			if( this[l].type === TOK.LINE )
				text.push(this[l].text);
		}
		return text.join('\n');
	},
	
	getHTML: function() {
		var html = '';
		if( this.type === TOK.SOURCE ) {
			var escape = { '<': '&lt', '>': '&gt;', '&': '&amp;' };
			html += '<pre class="prettyprint lang-js">'
			if( this.header ) html += '<h5>' + this.header.replace(/[<>&]/g, function(m) { return escape[m]; }) + '</h5>';
			html += this.getText().replace(/[<>&]/g, function(m) { return escape[m]; }) + '</pre>';
		} else {
			html += '<p>';
			var list = [];
			for ( var i = 0; i < this.length; i++ ) {
				var t = this[i];
				if( t.type === TOK.LINE ) {
					line = t.text;
					if( !line ) {
						html += '</p><p>\n';
						while(list.pop()) html += '</ul>';
					} else {
						line = line
							.replace(/[<>]/g, function(m) { return m == '<' ? '&lt;' : '&gt;'; })
							.replace(/&(#?[\w\d]+)?;/g, function(m) { return m.length > 1 ? m : '&amp;'; })
							.replace(/`(.*?)`/g, '<code>$1</code>')
							.replace(/`(.+?)\b/g, '<code>$1</code>')
							.replace(/#([$_a-zA-Z][$_\w]*)(\(\))?(=?)/ig, '<a href="#$1$3">$1$2$3</a>')
							.replace(/\[\[([$_A-Z][$_\w]*)\]\](\w*)/g, function(m, identifier, suffix) {
								var cls = t.doc.root.classes.getByName(identifier);
								if(!cls) return '<abbr title="Not found">' + identifier + suffix + '</abbr>';
								return '<a href="../' + cls.module.name + '/' + cls.name + '.html"'
									+ ' title="' + cls.module.name + '::' + cls.name + '">' + cls.name + suffix + '</a>';
							});
						if((match = /^(\s+)\*\s*/(line))) {
							var indent = match[1];
							while( !line.startsWith(list.join('')) ) {
								list.pop();
								html += '</ul>\n';
							}
							if( indent.length > list.join('').length ) {
								html += '<ul>\n';
								list.push(indent.substr(list.join('').length));
							}
							html += '<li>' + line.substr(match[0].length) + '</li>\n';
						} else {
							while(list.pop() !== undefined) html += '</ul>';
							html += line + '\n';
						}
					}
				} else if( t.type === TOK.SOURCE ) {
					while(list.pop() !== undefined) html += '</ul>';
					html += '</p>' + t.getHTML() + '<p>';
				}
			}
			while(list.pop() !== undefined) html += '</ul>';
			html += '</p>';
			html = html.replace(/<p>\s*<\/p>/, '');
		}
		return html;
	}
	
};

function toS(o, type, indent, depth) {
	indent = indent || [];
	type = type || Object;
	depth = depth || false;
	var s = type === Array ? '[\n' : '{\n';
	indent.push('	');
	
	if( type === Array ) {
		for ( var k = 0; k < o.length; k++ ) {
			s += indent.join('');
			if ( o[k] instanceof Node )
				s += o[k].toString(indent.slice());
			else if ( depth && typeof o[k] == 'object' ) {
				s += toS(o[k], o[k] instanceof Array ? Array : Object, indent.slice(), typeof depth == 'number' ? depth-1 : depth);
			} else s += o[k];
			s += k < o.length-1 ? ',\n' : '\n';
		}
	} else {
		for ( var k in o ) if( o.hasOwnProperty(k) ) {
			s += indent.join('') + k + ': ';
			if ( o[k] instanceof Node )
				s += o[k].toString(indent.slice());
			else if ( depth && typeof o[k] == 'object' ) {
				s += toS(o[k], o[k] instanceof Array ? Array : Object, indent.slice(), typeof depth == 'number' ? depth-1 : depth);
			} else s += o[k];
			s += '\n';
		}
	}
	
	indent.pop();
	s += indent.join('') + ( type === Array ? ']' : '}' );
	return s;
}

function Doc() {
	var t = new Node(null, TOK.DOC);
	t.doc = t;
	t.modules = [];
	return t;
}

String.prototype.startsWith = function(str) { return this.substr(0, str.length) == str };

function Tokenizer(s, f, l) {
	this.line = 0;
	this.source = s;
    this.tokens = [];
    this.tokenIndex = 0;
    this.filename = f || "";
    this.lineno = l || 1;
    this.indent = [];
    this.stack = [];
    this.expectingBlock = false;
    this.allowDeindent = true;
    this.currentModule = undefined;
    this.currentClass = undefined;
}

Tokenizer.prototype = {
	
	enter: function(node) {
		this.top().push(node);
		this.stack.push(node);
	},
	
	doc: function() {
		return this.stack[0];
	},
	
	top: function() {
		return this.stack[this.stack.length-1];
	},
	
	last: function() {
		var top = this.top();
		return top[top.length-1];
	},
	
	run: function() {
		var propRegex = /^(new\s+)?(?:([$_a-zA-Z][$_a-zA-Z0-9]*)\.)?([$_a-zA-Z][$_a-zA-Z0-9]*)(?:\[(.*?)\])?(?:\((.*?)\))?(?:\s*=\s*(.*?))?;?$/;
		
		var match, lines = this.source.split(/\r\n|\r|\n/);
		this.line = 0;
		this.stack = [Doc()];
		
		for ( var l = 0; l < lines.length; l++ ) {
			var line = lines[l];
			var indent = this.indent.join('');
			var broke = 0;
			
			while( !line.startsWith(indent) ) {
				if( !this.allowDeindent )
					throw this.newSyntaxError("Illegal de-indentation within a block that doesn't allow exit by deindent");
				this.indent.pop();
				this.stack.pop();
				indent = this.indent.join('');
				broke++;
				this.afterAtNote = false;
			}
	
			line = line.substr(indent.length);
	
			if(this.expectingBlock && !broke && (match = /^\s+/(line))) {
				this.indent.push(match[0]);
				indent += match[0];
				line = line.substr(match[0].length);
				this.expectingBlock = false;
			} else if(this.expectingBlock == 'require') {
				throw this.newSyntaxError("Expecting a new indentation block, none found");
			}
			if(this.expectingBlock) {
				this.stack.pop();
				this.expectingBlock = false;
				this.metaZone = false;
			}
			
			
			if (this.top().type !== TOK.SOURCE && (match = /^Description:?\s*$/(line))) {
				var t = new Node(this.doc(), TOK.DESCRIPTION);
				this.expectingBlock = true;
				if( this.top().type === TOK.CLASS ) {
					this.top().description = t;
				}
				this.enter(t);
			} else if (this.top().type == TOK.CLASS && (match = propRegex(line))) {
				this.expectingBlock = true;
				if( this.last().type === TOK.PROP && !this.last().length )
					var t = this.last();
				else {
					var t = new Node(this.doc(), TOK.PROP);
					this.top().props = this.top().props || [];
					this.top().props.push(t);
				}
				this.enter(t);
				this.metaZone = true;
				var c = { arguments: [] };
				t.calls.push(c);
				
				c.construct = !!match[1];
				c.on = match[2];
				c.name = match[3];
				c.namedProp = match[4] !== undefined;
				c.func = match[5] !== undefined;
				c.set = match[6] !== undefined;
				c.instanced = c.on !== this.currentClass.name;
				
				c.id = c.name;
				if(c.namedProp) {
					t.addArgument(match[4]);
					c.id = '[]';
				}
				if(c.set) {
					t.addArgument(match[6]);
					c.id += '=';
				}
				if(c.construct) c.id = 'new' + c.id;
				
				/*c.type =
					/^(?:new )?[$_a-zA-Z][$_\w]*(?:\.[$_a-zA-Z][$_\w]*)?\((.*?)\)/(line) ? 'func' :
					/^[$_a-zA-Z][$_\w]*\[/(line) ? '[]' :
					/^[$_a-zA-Z][$_\w]*\.[$_a-zA-Z][$_\w]*\s*=\s*(.*)$/(line) ? 'set' :
					'get';
				c.construct = /^new /.test(line);
				c.id = c.name =
					c.type == '[]' ? '[]' :
					c.construct ? 'new' :
					/^[$_a-zA-Z][$_\w]*\.([$_a-zA-Z][$_\w]*)/(line)[1];
				
				c.on = /^[$_a-zA-Z][$_\w]* /(line)[0];
				c.instanced = c.on !== this.currentClass.name;*/
				
				/*if (c.type == '[]') {
					match = /^[$_a-zA-Z][$_\w]*\[(.*?)\]/(line);
					t.addArgument(match[1]);
					t.id = '[]';
				} else if (c.type == 'set') {
					match = /^[$_a-zA-Z][$_\w]*\.[$_a-zA-Z][$_\w]*\s*=\s*(.*?);?$/(line)
					t.addArgument(match[1]);
					t.id += '=';
				} else if (c.type == 'func') {*/
				if(c.func) {
					//match = /^(?:new )?[$_a-zA-Z][$_\w]*(?:\.[$_a-zA-Z][$_\w]*)?\(\s*(.*)\s*\)/(line);
					
					var k, tk = match[5].scan(/\w+|\.{3}|,|=(?:[^\[\],]*)|\[|\]/g);
					var useAfter, after;
					var ident, defaultValue, openOptional, closeOptional;
					var lastArg;
					function finishArg() {
						if( !ident ) return;
						var o = {};
						if( defaultValue ) {
							o.defaultValue = defaultValue;
							o.optional = true;
						}
						o.optionalBlock = { open: false, close: false };
						if( openOptional == 1 ) o.optionalBlock.open = true;
						if( closeOptional == 1 ) o.optionalBlock.close = true;
						lastArg = t.addArgument(ident, o);
						ident = null;
						defaultValue = null;
						openOptional = Math.max(0, openOptional-1);
						closeOptional = Math.max(0, closeOptional-1);
					}
					while( k = tk.shift() ) {
						if( useAfter ) { after = useAfter; useAfter = null; }
						switch( k.charAt(0) ) {
						case ',':
							if( !after )
								throw this.newSyntaxError("Invalid leading comma in arguments list, a comma may not be used without any argument definitions before it");
							finishArg();
							
							break;
						case '=':
							if( !/^\w+$/(after) )
								throw this.newSyntaxError("Invalid default assignment (=) in arguments list. = May only follow a argument name. = followed a '" + after + "'");
							var defaultValue = k.match(/^=\s*(.*)$/)[1];
							break;
						case '[':
							useAfter = after;
							//if( after == '=' )
							//	throw this.newSyntaxError("Optional block opener ([) may not follow a default assignment (=)");
							
							openOptional = ident ? 2 : 1;
							
							break;
						case ']':
							useAfter = after;
							//if( after == '=' )
							//	throw this.newSyntaxError("Optional block closing (]) may not follow a default assignment (=)");
							if(ident) closeOptional = true;
							else if( lastArg ) lastArg.optionalBlock.close = true;
							else throw this.newSyntaxError("Invalid leading optional block closing (])");
							
							break;
						default:
							ident = k;
							
							break;
						}
						after = k.charAt(0);
					}
					finishArg();
					
				}
				
			} else if ((this.metaZone ||
					this.top().type === TOK.DOC ||
					this.top().type === TOK.MODULE ||
					this.top().type === TOK.CLASS) && (match = /^@(\w[-_$\w\d]*)(?:\s+(.*))?$/(line))) {
				var at = match[1];
				var value = match[2] || true;
				this.at(at, value);
			} else if (this.top().type === TOK.SOURCE && (match = /^----$/(line))) {
				this.metaZone = false;
				this.stack.pop();
				this.allowDeindent = true;
			} else if ((match = /^--\s*(.*)$/(line))) {
				var t = new Node(this.doc(), TOK.SOURCE);
				t.header = match[1];
				this.enter(t);
				this.allowDeindent = false;
			} else {
				if( /^\s+/(line) && this.afterAtNote ) {
					this.at(undefined, /^\s+(.*)$/(line)[1]);
				} else {
					var t = new Node(this.doc(), TOK.LINE);
					t.text = line;
					this.top().push(t);
					this.afterAtNote = false;
					this.metaZone = false;
				}
			}
		}
		
		return this.stack[0];
	},
	
	at: function(at, value) {
		var append = !at;
		at = at || this.afterAtNote;
		
		var top = this.top();
		switch(top.type) {
		case TOK.DOC:
		case TOK.CLASS:
		case TOK.MODULE:
			switch(at) {
			case 'module':
				if( this.top().type === TOK.CLASS ) this.stack.pop();
				if( this.top().type === TOK.MODULE ) this.stack.pop();
				var top = this.top();
				if( top.type !== TOK.DOC ) break;
				var mod = new Node(this.doc(), TOK.MODULE);
				mod.name = value;
				mod.classes = [];
				top.modules.push(mod);
				this.enter(mod);
				this.currentModule = mod;
				break;
			case 'func':
				value = '.func';
			case 'class':
				if( this.top().type === TOK.CLASS ) this.stack.pop();
				if( this.top().type === TOK.DOC ) {
					var m = new Node(this.doc(), TOK.MODULE);
					m.name = '_nil';
					m.classes = [];
					this.enter(m);
					this.currentModule = m;
				}
				var top = this.top();
				if( top.type !== TOK.MODULE ) break;
				var cls = new Node(this.doc(), TOK.CLASS);
				cls.module = this.currentModule;
				cls.name = value;
				top.classes.push(cls);
				this.enter(cls);
				this.currentClass = cls;
				break;
			}
			break;
		case TOK.PROP:
			switch(at) {
			case 'readonly':
			//case 'name': 
			case 'nameTBD':
				top[at] = value;
			case 'alias':
			case 'debate':
			case 'TBD':
				if( top[at] && top[at].length && append )
					top[at][top[at].length] += '\n' + value;
				else if( top[at] instanceof Array )
					top[at].push(value);
				else top[at] = [value];
				break;
			case 'param':
				var m = /^([$_a-zA-Z][$_\w]*)\s+(.*)$/(value);
				if(m) {
					if( top.args[m[1]] ) top.args[m[1]].text += m[2];
				}
				break;
			}
			break;
		}
		/*
		if (
		  ( /^(class|module)$/(at) && this.top().type == TOK.DOC ) ||
		  ( /^(readonly|alias|debate|(name)?TBD)$/(at) && this.top().type == TOK.PROP )
			) {
			if(append) this.top()[at] += '\n' + value;
			else this.top()[at] = value;
		} else if( at == 'param' && this.top().type == TOK.PROP ) {
			
		}
		*/
		this.afterAtNote = at;
	},
	
    newSyntaxError: function (m) {
        var e = new SyntaxError(m, this.filename, this.lineno + this.line);
        e.source = this.source;
        return e;
    }

};

var config = {
	outputDir: './out/', // slash ending directory path to compile api docs into
//	root: '',        // web root to find styles and scripts
	inputFiles: []
};

Array.slice = function(o) { return Array.prototype.slice.apply(o, Array.prototype.slice.call(arguments, 1)); };
var arg, args = Array.slice(system.args);
while( arg = args.shift() ) {
	switch(arg) {
	case '-o':
		config.outputDir = args.shift();
		break;
//	case '-w':
//		config.root = args.shift();
//		break;
	default:
		config.inputFiles.push(arg);
		break;
	}
}

var docs = [];

var fs = require('file');
var File = fs.File;

if( !fs.isDirectory(config.outputDir) ) fs.mkdirs(config.outputDir);

//fs.copy('./api2.css', config.outputDir);
//fs.copy('./api2.js', config.outputDir);
//fs.copyTree('./prettify/', config.outputDir);

for ( var input = config.inputFiles.slice(), file; file = input.shift(); ) {
	print("Reading " + file);
	var src = (new File(file, 'r')).read().toString();
	print("Tokenizing...");
	var t = new Tokenizer(src);
	var doc = t.run();
	docs.push(doc);
	print('');
}

print('Rooting objects...');
var root = { modules: {}, classes: [] };
root.classes.getByName = function(ident) {
	for ( var i = 0; i < this.length; i++ )
		if( this[i].name === ident )
			return this[i];
	return false;
}
for ( var d = docs.slice(), doc; doc = d.shift(); ) {
	print("Doing doc");
	
	doc.root = root;
	for ( var m = doc.modules.slice(); mod = m.shift(); ) {
		print("> Doing module " + mod.name);
		
		mod.root = root;
		root.modules[mod.name] = mod;
		for ( var c = mod.classes.slice(); cls = c.shift(); ) {
			print(">> Doing class " + cls.name);
			cls.root = root;
			root.classes.push(cls);
		}
	}
}
print('');

print('Combining JSON...');
var modules = {};
var modulesList = [];
var classesList = [];
for ( var d = docs.slice(), doc; doc = d.shift(); ) {
	for ( var m = doc.modules.slice(); mod = m.shift(); ) {
		var mob = modules[mod.name] || { module: mod.name, classes: {} };
		
		print("Doing module " + mod.name);
		for ( var c = mod.classes.slice(); cls = c.shift(); ) {
			print("> Doing class " + cls.name);
			mob.classes[cls.name] = cls.getJSON();
			classesList.push(mob.classes[cls.name]);
		}
		modules[mod.name] = mob;
	}
}
for ( var module in modules )
	modulesList.push(modules[module]);
print('');

print('Grabbing template...');
var tpl = {};
try {
	var jtpl = require('./json-template').Template;
	jtpl.prototype.writeTo = function(path, json) {
		print("Rendering template...");
		try {
			var output = this.expand(json);
		} catch ( e ) {
			print( e.name + ': ' + e.message );
			return false;
		}
		print("Writing to " + path);
		(new File(path, 'w')).write(output);
		return true;
	};
	
	tpl.indexTemplate = new jtpl(new File('templates/index.html', 'r').read().toString());
	tpl.moduleTemplate = new jtpl(new File('templates/module.html', 'r').read().toString());
	tpl.classTemplate = new jtpl(new File('templates/class.html', 'r').read().toString());
} catch ( e ) {
	print( e.name + ': ' + e.message );
	return;
}
print('');

print('Rendering index...');
tpl.indexTemplate.writeTo(config.outputDir + '/index.html', { modules: modulesList, classes: classesList });

print('Outputting modules...');
for ( var module in modules ) {
	var mod = modules[module];
	var modulePath = config.outputDir + module + '/';
	print("Inside module " + module);
	print("Path: " + modulePath);
	if( !fs.isDirectory(modulePath) ) fs.mkdirs(modulePath);
	
	var mob = {};
	for ( var k in mod ) if ( k !== 'classes' ) mob[k] = mod[k];
	mob.classes = [];
	for ( var c in mod.classes ) {
		mob.classes.push( mod.classes[c] );
	}
	
	tpl.moduleTemplate.writeTo(modulePath + 'index.html', mob);
	
	for ( var className in mod.classes ) {
		var	cls = mod.classes[className];
		var classPath = modulePath + className + '.html';
		tpl.classTemplate.writeTo(classPath, cls);
	}
	print('');
}

//system.stdin.read().toString()
/*
var t = new Tokenizer('');
var doc = t.run();



try {
	
	tpl.expand(doc.getJSON())
	//system.stdout.write();
} catch ( e ) {
	print( e.name + ': ' + e.message );
}

