/*
 *  passist - passing siteswap assistant
 *  Copyright (C) 2019 Christian Helbling
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// minimalistic implementation of it_html in js without quoting
// see https://itools.search.ch/ for the original php version
var tag = function (tag) {
	return function() {
		var i = 0;
		var args = {};
		var content = '';
		if (typeof(arguments[i]) == 'object') {
			args = arguments[i];
			i++;
		}
		for (; i < arguments.length; i++)
			content += arguments[i];

		var attributes = '';
		for (var key in args)
			attributes += ' ' + key + '="' + ("" + args[key]).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;") + '"';

		return '<' + tag + attributes + '>' + content + '</' + tag + '>';
	};
}
var tags = "a,b,br,button,div,em,fieldset,form,h1,h2,h3,h4,h5,h6,hr,img,input,label,legend,li,meta,noscript,p,pre,small,span,style,sub,sup,table,tbody,td,textarea,tfoot,th,thead,tr,ul,ol,article,section,defs,desc,g,image,line,marker,path,pattern,rect,svg,text,textPath,circle,canvas".split(',');
for (var i in tags)
	window[tags[i]] = tag(tags[i]);


// template
var card = function() {
	var i = 0;
	var args = {};
	var content = '';
	if (typeof(arguments[i]) == 'object') {
		args = arguments[i];
		i++;
	}
	for (; i < arguments.length; i++)
		content += arguments[i];
	return div({class:'card mb-4'},
		args.title ? div({class:'card-header'}, args.title) : '',
		div({class:'card-body'},
			content
		)
	);
};

function input_field(p) {
	var title = p.title ? p.title : p.label;
	var input_attr = {
		type:      p.type,
		'v-model': p.id,
		id:        p.id,
		class:    'form-control',
	};
	if (p.type == 'number') {
		input_attr.inputmode = 'number';
		input_attr.min = 'min' in p ? p.min : 0;
		if (p.max)
			input_attr.max = p.max;
		input_attr.class += (p.max && p.max < 10) ? ' digit' : ' twodigit';
	} else {
		input_attr.placeholder = p.placeholder ? p.placeholder : p.label;
		for (k in p.attr)
			input_attr[k] = p.attr[k];
	}
	return [
		label({
			class: 'sr-only',
			for:   p.id,
			}, title
		),
		div({class:'input-group ' + p.id},
			div({class:'input-group-prepend'},
				div({
					class: 'input-group-text',
					title: title,
					}, p.label
				)
			),
			input(input_attr)
		),
	].join('');
}

var generator_col = [
	div({class:'form-inline'},
		input_field({id:'gen_objects',     label:'#Objects', title:'Number of objects', type:'number', min:1, max:35}),
		input_field({id:'gen_period',      label:'Period',    type:'number', min:1, max:15 }),
		input_field({id:'gen_max_throw',   label:'Max throw', type:'number', min:1, max:35 }),
		input_field({id:'gen_min_throw',   label:'Min throw', type:'number', min:0, max:35 }),
		input_field({id:'gen_n_jugglers',  label:'👥', title:'Number of jugglers', type:'number', min:0, max:9 }),
		input_field({id:'gen_include',     label:'Include global', type:'search', placeholder:'e.g. 2 8'}),
		input_field({id:'gen_exclude',     label:'Exclude global', type:'search'})
	),

	h5({class:'mt-4'}, '{{gen_list.length}} siteswaps found'),

	div({class:'siteswap_scroll'},
		ul({class:'mt-4 siteswap_list'},
			li({'v-for': 's in gen_list'},
				span({'v-if':'s == "timeout"'}, "generator timeout :("),
				a({'v-else':'v-else', href:'#siteswap_col', 'v-on:click':'siteswap_input = s; n_jugglers_input = gen_n_jugglers'}, span({class:'siteswap'}, '{{s}}'))
			)
		)
	),
	div({'v-if': '!gen_list.length'},
		img({src:'images/mr_meeseeks_shocked_small.png', alt:'mr meeseeks is shocked to see no siteswaps'})
	)
].join('');

var causal_diagram = svg(
	{
		':width': 'causal_diagram.width',
		':height': 'causal_diagram.height',
	},
	defs(
		marker({
			'id': 'arrow',
			'markerWidth': 10,
			'markerHeight': 10,
			'refX': 0,
			'refY': 3,
			'orient': 'auto',
			'markerUnits': 'strokeWidth',
			},
			path({
				class: 'arrow_fill',
				d: 'M0,0 L0,6 L9,3 z',
			})
		)
	),
	rect({
		'x': 0,
		'y': 0,
		':width': 'causal_diagram.width',
		':height': 'causal_diagram.height',
		'stroke': '#ccc',
		'stroke-width': '2px',
		'fill': 'none',
	}),
	text({
		'v-for': "(j, i) in jugglers",
		':x'  : "10",
		':y'  : "causal_diagram.yoff + 9 + i * causal_diagram.dy",
		'font-size': 20,
		'stroke-width': '0px',
		'stroke': 'black',
		},
		'{{j.name}}'
	),
	text({
		'v-for': "(j, i) in jugglers",
		':x'  : "20",
		':y'  : "causal_diagram.yoff - 10 + i * causal_diagram.dy",
		'font-size': 20,
		'stroke-width': '0px',
		'stroke': 'black',
		},
		'{{j.start_obj_left}}'
	),
	text({
		'v-for': "(j, i) in jugglers",
		':x'  : "20",
		':y'  : "causal_diagram.yoff + 30 + i * causal_diagram.dy",
		'font-size': 20,
		'stroke-width': '0px',
		'stroke': 'black',
		},
		'{{j.start_obj_right}}'
	),
	circle({
		'v-for': "(n, i) in causal_diagram.nodes",
		':cx'  : "n.x",
		':cy'  : "n.y",
		':r'   : "n.r",
		':class': 'n.class',
		'stroke': 'black',
		'stroke-width': 2,
	}),
	text({
		'v-for': "(n, i) in causal_diagram.nodes",
		':x'  : "n.x",
		':y'  : "n.y + 5",
		'class': 'node_label',
		':class': 'n.class',
		'font-size': 16,
		'stroke-width': '0px',
		'text-anchor': 'middle',
		},
		'{{n.label}}'
	),
	path({
		'class': 'arrow_stroke',
		'v-for': "(n, i) in causal_diagram.nodes",
		'v-if': 'n.arrow',
		':d': 'n.arrow',
		'stroke-width': '2px',
		'fill': 'none',
		'marker-end': "url(#arrow)",
	})
)

var jif_causal_diagram = p({
		'v-if': 'jif_causal_diagram.error',
		}, '{{jif_causal_diagram.error}}'
	) + svg(
	{
		'v-if': '!jif_causal_diagram.error',
		':width': 'jif_causal_diagram.width',
		':height': 'jif_causal_diagram.height',
	},
	defs(
		marker({
			'id': 'arrow',
			'markerWidth': 10,
			'markerHeight': 10,
			'refX': 0,
			'refY': 3,
			'orient': 'auto',
			'markerUnits': 'strokeWidth',
			},
			path({
				class: 'arrow_fill',
				d: 'M0,0 L0,6 L9,3 z',
			})
		)
	),
	rect({
		'x': 0,
		'y': 0,
		':width': 'jif_causal_diagram.width',
		':height': 'jif_causal_diagram.height',
		'stroke': '#ccc',
		'stroke-width': '2px',
		'fill': 'none',
	}),
	text({
		'v-for': "(j, i) in jugglers",
		':x'  : "10",
		':y'  : "jif_causal_diagram.yoff + 9 + i * jif_causal_diagram.dy",
		'font-size': 20,
		'stroke-width': '0px',
		'stroke': 'black',
		},
		'{{j.name}}'
	),
	text({
		'v-for': "(j, i) in jugglers",
		':x'  : "20",
		':y'  : "jif_causal_diagram.yoff - 10 + i * jif_causal_diagram.dy",
		'font-size': 20,
		'stroke-width': '0px',
		'stroke': 'black',
		},
		'{{j.start_obj_left}}'
	),
	text({
		'v-for': "(j, i) in jugglers",
		':x'  : "20",
		':y'  : "jif_causal_diagram.yoff + 30 + i * jif_causal_diagram.dy",
		'font-size': 20,
		'stroke-width': '0px',
		'stroke': 'black',
		},
		'{{j.start_obj_right}}'
	),
	circle({
		'v-for': "(n, i) in jif_causal_diagram.nodes",
		':cx'  : "n.x",
		':cy'  : "n.y",
		':r'   : "n.r",
		':class': 'n.class',
		'stroke': 'black',
		'stroke-width': 2,
	}),
	text({
		'v-for': "(n, i) in jif_causal_diagram.nodes",
		':x'  : "n.x",
		':y'  : "n.y + 5",
		'class': 'node_label',
		':class': 'n.class',
		'font-size': 16,
		'stroke-width': '0px',
		'text-anchor': 'middle',
		},
		'{{n.label}}'
	),
	path({
		'class': 'arrow_stroke',
		'v-for': "(n, i) in jif_causal_diagram.nodes",
		'v-if': 'n.arrow',
		':d': 'n.arrow',
		'stroke-width': '2px',
		'fill': 'none',
		'marker-end': "url(#arrow)",
	})
);

var siteswap_col = [
	div({class:'form-inline'},
		input_field({id:'siteswap_input',  label:'Siteswap', type:'search', attr:{ inputmode: 'verbatim', pattern:'[0-9a-zA-Z ]+', ':class':'validClass', size:10 }}),
		input_field({id:'n_jugglers_input',  label:'👥', title:'Number of jugglers', type:'number', min:0, max:9 })
	),
	div({'v-if': 'valid'},
		h2(
			a({class:'arrow', 'v-on:click':'siteswap_shift = (siteswap_shift + 1) % period'}, '◄'), // ⯇
			' {{siteswap.to_string()}} ',
			a({class:'arrow', 'v-on:click':'siteswap_shift = (siteswap_shift + period - 1) % period'}, '►'), // ⯈

			span({'v-if': 'siteswap_name'}, ' {{siteswap_name}}')
		),
		p(
			'{{n_objects}} objects, period {{period}}, squeezes {{start_properties.squeezes}}',
			span({'v-if': 'start_properties.is_ground_state'}, ', ground state'),
// 			span({'v-if': 'n_jugglers > 1'}, ', interface: {{siteswap.global_interface(n_jugglers)}}')
		 ),

		div({'v-if': 'n_jugglers > 1', class:'local_throws'},
			table(
				tr(
					td('Local&nbsp;'),
					td({':colspan':'local_period + 1'}, 'Siteswap'),
					td({':colspan':'local_period + 1'},
						a({'v-if': 'n_jugglers == 2', ':href':'prechacthis_url'}, 'Prechac'),
						span({'v-else':true}, 'Prechac')
					),
					td({'v-if': 'n_jugglers == 2', ':colspan':'local_period'},     'Words')
				),
				tr({'v-for': "j in jugglers"},
					th('{{j.name}}', sub('{{j.start_obj_left}}|{{j.start_obj_right}}')),
					td({'v-for': "t in j.local", 'v-html':'t.siteswap + t.desc + "&nbsp;"'}),
					td({class:"px-3"}, ''),
					td({'v-for': "t in j.local", 'v-html':'t.prechac + t.desc + "&nbsp;"'}),
					td({'v-if': 'n_jugglers == 2', class:"px-3"}, ''),
					td({'v-if': 'n_jugglers == 2', 'v-for': "t in j.local", 'v-html':'t.word + ",&nbsp;"'})
				)
			)
		),
		h4('Causal diagram'),
		div({class:'causal_diagram'},
			causal_diagram
		)
	),
].join('');

var template = div({class:'container'},
	div({class:'row'},
		div({class: 'col generator'},
			card({title:'Generator'}, generator_col)
		)
	), div({class:'row'},
		div({id:'siteswap_col', class: 'col siteswap'},
			card({title:'Siteswap'}, siteswap_col)
		)
	), div({class:'row'},
		div({class: 'col known_siteswaps'},
			card({title:'Well-known siteswaps'},
				p(small('© Christian Kästner, ', a({href: 'https://github.com/ckaestne/CompatSiteswaps/blob/master/named-siteswaps.txt'}, 'named-siteswaps.txt'))),
				ul({class:'siteswap_list'},
					li({'v-for': 's in known_siteswaps'},
						a({href:'#jif', 'v-on:click':'siteswap_input = s[0]; n_jugglers_input = 2'}, span({class:'siteswap'}, '{{s[0]}}'), span({class:'name'}, '{{s[1]}}'))
					)
				)
			)
		)
	), div({class:'row'},
		div({id:'jif', class: 'col jif'},
			card({title:'JIF - Juggling Interchange Format'},
				div(textarea({
					'v-model':'jif_input',
					class:'jif_input',
					}, '{{jif_input}}'
				)),
				div(
					h4('Causal diagram'),
					div({class:'causal_diagram'},
						jif_causal_diagram
					)
				),
				div(
					h4('Animation'),
// 					canvas({id:'animation'},
// 						"Oh no! Your browser doesn't support canvas!"
// 					)
					div({id:'animation'}),
					'{{update_scene}}',
				)
			)
		)
	),

	div({class:'padding_bottom'}) // add some white space to the page end so that we never loose the scroll position when editing the siteswap
);

var known_siteswaps = [
	["645", "killer bunny"],
	["744", "5 club one count"],
	["726", "5 club one count"],
	["726", "coconut laden swallow"],
	["942", "glass elevator"],
	["867", "French 3 count"],
	["966", "7 club three count"],
	["756", "baby dragon; zap opus 1; holy hand-grenade"],
	["945", "dragon; black beast of aaaarg..."],
	["996", "8 club pps"],
	["7", "7 club one count"],
	["9", "9 club one count"],
	["975", "Holy Grail; zap opus two"],
	["64645", "zap intro"],
	["86227", "5 club why not"],
	["86722", "5 club not why"],
	["86867", "5 count popcorn (44)"],
	["77772", "Martin's one count (async)"],
	["77722", "parsnip"],
	["77222", "inverted parsnip"],
	["77466666", "Jim's 3 count (async)"],
	["77466", "Jim's 2 count (async)"],
	["774", "Jim's 1 count (async)"],
	["7777266", "Mild Madness (async)"],
	["77862", "why not"],
	["77286", "not why"],
	["78672", "maybe"],
	["96672", "not likely"],
	["79662", "maybe not"],
	["77786", "Funky Bookends"],
	["7a666", "5 count popcorn"],
	["966a666", "7 count popcorn (variation)"],
	["9668686", "7 count popcorn (variation)"],
	["7a66686", "7 count popcorn (variation)"],
	["786a666", "7 count popcorn (variation)"],
	["7868686", "7 count popcorn"],
	["9669964", "7 club Jim's 2 count"],
	["9968926", "7 club why not"],
	["9788926", "7 club why not (variation)"],
	["9689962", "7 club not why"],
	["9689782", "7 club not why (variation)"],
	["7889962", "7 club not why (variation)"],
	["7889782", "7 club not why (variation)"],
	["9969268", "7 club maybe (1)"],
	["9968296", "7 club maybe (2)"],
	["9968278", "7 club maybe (variation)"],
	["9669968926", "why rei"],
	["9964786", "7 club Jim's 2 count (variation)"],
	["9784966", "7 club Jim's 2 count (variation)"],
	["9784786", "7 club Jim's 2 count (variation)"],
	["b64", "Odd Scots"],
	["726778827", "Self Centered"],
	["7747746677466", "Jim's ppsps (async)"],
	["8686777", "Vitoria"],
	["7742744", "Flipalot"],
	["7747746677466", "Brainstorming / Jim's pssps (async)"],
	["9969788", "Poem"],
	["9968978", "Clean Finish"],
	["9968897", "Real Fake Clean Finish"],
	["75724", "Kaatzi"],
	["8897926", "Good Morning"],
	["7966966", "Good Night"],
	["89742", "The One to Concentrate"],
	["9789788", "Milk Duds"],
	["9647772", "Odnom"],
	["a2747", "aa7 Warmup Pattern"],
	["9797888", "8 Club Vitoria"],
	["7966786", "Aspirin"],
	["7966966", "Placebo"],
	["996882777", "Grosses Chaos"],
	["5888222", "Heffalot"],
	["9522458", "5 club pattern you cannot do #1"],
	["5726258", "5 club pattern you cannot do #2"],
	["97522", "Dragonfly"],
	["8672255", "Uwe Pattern"],
	["9794884", "James' special day"],
	["b7575", "Ark of the Covenant"],
	["d757575", "Temple of Doom"],
];

var app = new Vue({
	el: '#siteswap',
	template: template,
	data: {
		siteswap_input: 86277,
		siteswap_shift: 0,
		n_jugglers_input: 2,
		known_siteswaps: known_siteswaps,
		gen_objects:   7,
		gen_period:    5,
		gen_min_throw: 2,
		gen_max_throw: 10,
		gen_n_jugglers: 2,
		gen_include: '',
		gen_exclude: '3 5',
		jif_input:   ''
	},
	computed: {
		stripped_input: function() {
			return String(this.siteswap_input).replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
		},
		original_siteswap: function() {
			return new Siteswap(this.stripped_input);
		},
		siteswap: function() {
			return this.original_siteswap.shift(this.siteswap_shift);
		},
		period: function() {
			return this.siteswap.period;
		},
		local_period: function() {
			return this.period % this.n_jugglers == 0 ? this.period / this.n_jugglers : this.period
		},
		n_objects: function() {
			return this.siteswap.objects;
		},
		n_jugglers: function() {
			var result = parseInt(this.n_jugglers_input);
			if (result >= 10)
				this.n_jugglers_input = result = parseInt(this.n_jugglers_input.slice(-1));
			if (result <= 0)
				this.n_jugglers_input = result = 2;
			return result;
		},
		valid: function() {
			return this.siteswap.is_valid();
		},
		validClass: function() {
			return this.valid == false ? 'text-danger' : '';
		},
		jugglers: function() {
			var n_jugglers = this.n_jugglers;
			var start_hands = Array.apply(null, Array(n_jugglers * 2)).map(function() {return 0;});
			var i = 0;
			var has_obj = [];
			var heights = this.siteswap.heights;
			for (var missing = this.n_objects; missing > 0; i++) {
				var t = heights[i % this.period];
				if (t > 0) {
					if (!has_obj[i]) {
						start_hands[i % (n_jugglers * 2)]++;
						missing--;
					}
					has_obj[i + t] = true;
				}
			}
			var result = new Array(n_jugglers);
			for (var juggler = 0; juggler < n_jugglers; juggler++) {
				var period = this.period;
				var local_period = period % n_jugglers == 0 ? period / n_jugglers : period;
				var local = new Array(local_period);
				for (var i = 0; i < local_period; i++)
					local[i] = String(heights[(juggler + i * n_jugglers) % period]);
				var name = function(i) {
					return String.fromCharCode('A'.charCodeAt(0) + i);
				};
				var left = function(i) {
					return (i / n_jugglers) & 1;
				};
				result[juggler] = {
					local: local.map(function(t, i) {
						var a = juggler + i * n_jugglers;
						var b = a + +t;
						var desc = '';
						if (t % n_jugglers) {
							if (n_jugglers > 2)
								desc += name(b % n_jugglers);
							desc += left(a) == left(b) ? 'X' : '||';
							desc = sub(desc);
						}
						return {
							height: t,
							siteswap: Siteswap.height_to_char(t),
							prechac:  this.prechac(t, n_jugglers),
							word:  this.word(t),
							desc: desc ? desc : '&nbsp;'
						};
					}.bind(this)),
					name:  name(juggler),
					start_obj_right: start_hands[juggler],
					start_obj_left:  start_hands[n_jugglers + juggler],
				};
			}
			return result;
		},
		causal_diagram: function() {
			var n_jugglers = this.n_jugglers;
			var arrow_length = 20;
			var p = {
				r:    13,
				xoff: 55,
				yoff: 70,
				dx:   70 / n_jugglers,
				dy:   100,
				nodes: [],
			};
			var juggler = function(i) { return (i + n_jugglers * 10) % n_jugglers;};
			var x  = function(i) { return p.xoff + i * p.dx;};
			var y  = function(i) { return p.yoff + juggler(i) * p.dy;};
			var xy = function(i, shorten, towards_x, towards_y) {
				var X = x(i);
				var Y = y(i);
				if (shorten) {
					var dx = towards_x - X;
					var dy = towards_y - Y;
					var len = Math.sqrt(dx * dx + dy * dy);
					X += shorten * dx / len;
					Y += shorten * dy / len;
				}
				return X + ',' + Y;
			}

			var arrow = function(i, step) {
				var j = i + step;
				var ji = juggler(i);
				var jj = juggler(j);
				if (ji != jj || Math.abs(step) == n_jugglers)
					return "M" + xy(i, p.r, x(j), y(j)) + " L" + xy(j, p.r + arrow_length, x(i), y(i));
				var dir_x = x(j) > x(i) ? 1 : -1;
				var dir_y = ji ? 1 : -1;

				var offset_x = dir_x * p.dy / 2;
				var offset_y = dir_y * p.dy / 2;

				var control_point1 = (x(i) + offset_x) + "," + (y(i) + offset_y);
				var control_point2 = (x(j) - offset_x) + "," + (y(i) + offset_y);
				return "M" + xy(i, p.r, x(i) + dir_x, y(i) + dir_y)
				     + "C" + control_point1
				     + " " + control_point2
				     + " " + xy(j, p.r + arrow_length, x(j) - dir_x, y(i) + dir_y);
			};
			p.steps = n_jugglers * this.period * 2;
			var heights = this.siteswap.heights;
			for (var i = 0; i < p.steps; i++) {
				var pos = i % this.period;
				var cur_throw = heights[pos];
				p.nodes.push({
					r: p.r,
					x: x(i),
					y: y(i),
					class: (Math.floor(i / n_jugglers) % 2) ? 'left_hand' : 'right_hand',
					juggler: juggler(i),
					label: Siteswap.height_to_char(cur_throw),
					arrow: arrow(i, heights[pos] - 2 * n_jugglers), // for ladder diagram: don't subtract 2 * n_jugglers
				});
			}

			p.width  =  p.steps * p.dx + 50;
			p.height = (this.n_jugglers - (this.n_jugglers > 1 ? 1 : 1.4)) * p.dy + 2 * p.yoff;


			this.jif_input = this.jif_json;

			return p;
		},

		gen_list: function() {
			var t0 = performance.now();

			var min = Math.max(0, Math.min(35, parseInt(this.gen_min_throw)));
			var max = Math.max(0, Math.min(35, parseInt(this.gen_max_throw)));
			var objects = Math.max(0, Math.min(35, parseInt(this.gen_objects)));
			var period = Math.max(1, Math.min(15, parseInt(this.gen_period)));
			var n_jugglers = Math.max(1, Math.min(9, parseInt(this.gen_n_jugglers)));
			this.gen_min_throw = min;
			this.gen_max_throw = max;
			this.gen_objects = objects;
			this.gen_period = period;
			this.gen_n_jugglers = n_jugglers;

			min = min || 0;
			max = max || 0;

			var is_canonic = function(siteswap) {
				var shifts = [];
				for (var i = 0; i < period; i++)
					shifts.push(siteswap.slice(i) + siteswap.slice(0, i));
				return shifts.sort()[period - 1] == siteswap;
			};
			function filters(input) {
				var selfs = [];
				var passes = [];
				for (var i = min; i <= max; i++) {
					if (i % n_jugglers)
						passes.push(i);
					else
						selfs.push(i);
				}
				input = input.trim().replace(/s/gi, '[' + selfs.join('') + ']').replace(/p/gi, '[' + passes.join('') + ']');
				return input ? input.split(/ /) : [];
			}
			var exclude_filters = filters(this.gen_exclude);
			var include_filters = filters(this.gen_include);

			function exclude(str) {
				return exclude_filters.some(function(filter) { return (str + str + str).match(filter);});
			}
			function include(str) {
				return include_filters.every(function(filter) { return (str + str + str).match(filter);});
			}

			var final_check = function(canonic) {
				// check if it is a smaller period which is repeated
				for (var p = 1; p < period; p++) {
					if (period % p == 0) {
						// splits canonic into period / i chunks of i characters
						// if all chunks are equal, we have found a smaller period p
						if (Array.apply(null, {length: period / p}).map(Function.call, Number).map(function (k) {
								return canonic.slice(p * k, p * (k + 1));
							}).every(function (val, i, arr) { return val === arr[0]; }))
								return false;
					}
				}

				if (n_jugglers > 1) {
					// TODO: check if there is at least one pass for every juggler (example: a56 for 3 jugglers makes C do only flips)

					var n_passes = 0;
					for (var i = 0; i < period; i++) {
						if (this.get_height(canonic, i) % n_jugglers)
							n_passes++;
					}
					// TODO: let user specify n_passes range
					if (n_passes == 0)
						return false;
				}

				// check constraints
				if (exclude(canonic) || !include(canonic))
					return false;

				return true;
			}.bind(this);

			var result = [];
			var steps = 0;
			var heights = new Array(period).fill(-1);
			var landing = new Array(period).fill(0);
			var sum = 0;
			var i = 0;
			while (i >= 0) {
				steps++;

				if (steps % 1000 == 0) {
					var t1 = performance.now();
					if (t1 - t0 > 1000) {
						result.push("timeout");
						return result;
					}
				}

				if (i == period) {
					var c = Siteswap.heights_to_string(heights);
					if (is_canonic(c) && final_check(c)) {
						result.push(c);
// 						if (result.length >= 100)
// 							break; // TODO: mechanism to add more siteswaps when scrolling down
					}

					i--;
				} else {
					var h = heights[i];
					if (h >= 0) {
						landing[(i + h) % period] = 0;
						sum -= h;
						heights[i]++;
					}

					var min_t = Math.max(min, objects * period - sum - (period - i - 1) * max);
					var max_t = Math.min(max, objects * period - sum - (period - i - 1) * min);
					if (i > 1)
						max_t = Math.min(heights[0], max_t); // otherwise siteswap would not be canonic anymore

					if (h < 0)
						heights[i] = min_t;

					while (heights[i] <= max_t + 1 && landing[(i + heights[i]) % period])
						heights[i]++;

					if (heights[i] > max_t) {
						heights[i] = -1;
						i--;
						continue;
					}

					landing[(i + heights[i]) % period] = 1;
					sum += heights[i];

					i++;
				}
			}

// 			var t1 = performance.now();
// 			console.log('new: steps:', steps, 'found:', result.length, 'time [ms]:', Math.round(t1 - t0));
			return result;
		},
		prechacthis_url: function() {
			return 'http://prechacthis.org/info.php?pattern=['
			       + this.jugglers[0].local.map(function(x) { h = x.height / 2; return 'p(' + h + (+x.height & 1 ? ',1,' + (h + this.local_period / 2) : ',0,' + h) + ')';}.bind(this)).join(',')
			       + ']&persons=2';
		},
		siteswap_names: function() {
			var result = {}
			for (var i in this.known_siteswaps) {
				var ss = this.known_siteswaps[i];
// 				result[this.canonic_siteswap(ss[0])] = ss[1];
				result[new Siteswap(ss[0]).canonic_string()] = ss[1];
			}
			return result;
		},
		siteswap_name: function() {
			return this.siteswap_names[this.siteswap.canonic_string()];
		},
		optimal_shift: function() {
			var opt_weight = -1;
			var result = 0;
			for (var shift = 0; shift < this.period; shift++) {
				var start_properties = this.original_siteswap.shift(shift).get_start_properties(this.n_jugglers);
				var weight = 100 * start_properties.is_ground_state - 10 * start_properties.squeezes + start_properties.starts_with_pass;
				if (weight > opt_weight) {
					opt_weight = weight;
					result = shift;
				}
			}
			return result;
		},
		start_properties: function() {
			return this.siteswap.get_start_properties(this.n_jugglers);
		},
		jif: function() {
			var steps = this.n_jugglers * this.period * 2 * this.n_objects; // TODO: calculate smaller number or have a relabeling mechanism
			var p = {};
			if (this.siteswap_name)
				p.title = this.siteswap_name;
			p.siteswap = this.siteswap.to_string();
			var heights = this.siteswap.heights;
			var n_hands = this.n_jugglers * 2;
			p.n_hands = n_hands;
			p.n_props = this.n_objects;

			p.time_period = steps;
			p.events = [];
			for (var i = 0; i < steps; i++) {
				var height = heights[i % this.period];
				p.events.push({
					type: 'throw',
					time: i,
					duration: height,
					from_hand: i % n_hands,
					to_hand: (i + height) % n_hands,
					label: Siteswap.height_to_char(height)
				})
			}

			// calculate which throw corresponds to which prop
			var propid = 0;
			for (var i = 0; i < steps; i++) {
				var prop = p.events[i].prop;
				if (prop === undefined) {
					var j = i;
					p.events[j].prop = propid;
					do {
						j += p.events[j].duration;
						p.events[j % steps].prop = propid;
					} while(j < steps);

					propid++;
				}
			}

			return p;
		},
		jif_json: function() {
			return JSON.stringify(this.jif, null, 2);
		},
// 		animation_jif: function() {
// 			var jif = this.jif;
// 			// TODO: calculate dwell times
// 			return jif;
// 		},
		jif_causal_diagram: function() {
			var jif;
			try {
				jif = JSON.parse(this.jif_input);
			} catch(e) {
				return {error: 'not valid json'};
			}

			var n_jugglers = this.n_jugglers;
			var arrow_length = 20;
			var p = {
				r:    13,
				xoff: 55,
				yoff: 70,
				dx:   70 / n_jugglers,
				dy:   100,
				nodes: [],
			};
			var x  = function(i) { return p.xoff + i * p.dx;};
			var y  = function(i, juggler) { return p.yoff + juggler * p.dy;};
			var xy = function(i, shorten, towards_x, towards_y, juggler) {
				var X = x(i);
				var Y = y(i, juggler);
				if (shorten) {
					var dx = towards_x - X;
					var dy = towards_y - Y;
					var len = Math.sqrt(dx * dx + dy * dy);
					X += shorten * dx / len;
					Y += shorten * dy / len;
				}
				return X + ',' + Y;
			}

			var arrow = function(i, step, juggler_from, juggler_to) {
				var j = i + step;
				if (juggler_from != juggler_to || Math.abs(step) == n_jugglers)
					return "M" + xy(i, p.r, x(j), y(j, juggler_from), juggler_from) + " L" + xy(j, p.r + arrow_length, x(i), y(i, juggler_from), juggler_to);
				var dir_x = x(j) > x(i) ? 1 : -1;
				var dir_y = juggler_from ? 1 : -1;

				var offset_x = dir_x * p.dy / 2;
				var offset_y = dir_y * p.dy / 2;

				var control_point1 = (x(i) + offset_x) + "," + (y(i, juggler_from) + offset_y);
				var control_point2 = (x(j) - offset_x) + "," + (y(i, juggler_from) + offset_y);
				return "M" + xy(i, p.r, x(i) + dir_x, y(i, juggler_from) + dir_y, juggler_from)
				     + "C" + control_point1
				     + " " + control_point2
				     + " " + xy(j, p.r + arrow_length, x(j) - dir_x, y(i, juggler_from) + dir_y, juggler_from);
			};
			p.steps = n_jugglers * this.period * 2;

			for (var i = 0; i < jif.events.length; i++) {
				var event = jif.events[i];
				if (event.type != 'throw')
					continue;
				var t = event.time;
				var juggler_from = event.from_hand % n_jugglers;
				var juggler_to = event.to_hand % n_jugglers;

				p.nodes.push({
					r: p.r,
					x: x(t),
					y: y(t, juggler_from),
					class: (Math.floor(event.from_hand / n_jugglers) % 2) ? 'left_hand' : 'right_hand',
					juggler: juggler_from,
					label: event.label,
					arrow: arrow(i, event.duration - 2 * n_jugglers, juggler_from, juggler_to), // for ladder diagram: don't subtract 2 * n_jugglers
				});

			}

			p.width  =  p.steps * p.dx + 50;
			p.height = (this.n_jugglers - (this.n_jugglers > 1 ? 1 : 1.4)) * p.dy + 2 * p.yoff;
			return p;
		},
		update_scene: function() {
			window.jif = this.jif;
			if ('updateScene' in window)
				updateScene();
			return '';
		}
	},
	methods: {
		prechac: function(x, n_jugglers) {
			return Math.round(+x / n_jugglers * 100) / 100;
		},
		word: function(x) {
			var word = [
				'wait',
				1,
				'zip',
				3,
				'flip',
				'zap',
				'self',
				'single pass',
				'heff',
				'double pass',
				'triple self',
				'triple pass'
			][x];
			return word ? word : x;
		},
		get_height: function(siteswap, i) {
			var x = siteswap.charCodeAt(i);
			if (x >= 48 && x <= 57)
				return x - 48;
			else if (x >= 97 && x <= 122)
				return x - 87;
			else
				throw "invalid character in siteswap: " + siteswap.charAt(i);
		}
	},
	mounted: function() {
		var siteswap = localStorage.getItem('siteswap');
		if (siteswap)
			this.siteswap_input = siteswap;
		var n_jugglers = localStorage.getItem('n_jugglers');
		if (n_jugglers)
			this.n_jugglers_input = n_jugglers;
		var jif = localStorage.getItem('jif');
		if (jif)
			this.jif_input = jif;
	},
	watch: {
		siteswap_input: {
			handler() {
				localStorage.setItem('siteswap', this.siteswap_input);
				this.siteswap_shift = this.optimal_shift;
			},
		},
		jif_input: {
			handler() {
				localStorage.setItem('jif', this.jif_input);
			},
		},
		n_jugglers_input: {
			handler() {
				localStorage.setItem('n_jugglers', this.n_jugglers_input);
			},
		}
	},
});

// make web app work offline
if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
		navigator.serviceWorker.register('/service_worker.js');
	});
}
