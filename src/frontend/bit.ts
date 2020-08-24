interface BodyType {
	data: string;
	type?: 'text/json' | 'application/x-www-form-urlencoded' | string;
}

interface RequestOptions {
	method: 'GET'|'POST'|'PUT'|'DELETE'|string;
	queryParams?: string|{
		[key:string]: string;
	};
	body?: string|BodyType;
	bodyJson?: any;
	bodyForm?: {
		[key:string]: string;
	};
	headers?: {
		[key: string]: string;
	};
}

class Ajax {
	public defaultUrl = document.location.href.toString();
	public addRandom : string|null = null;

	private addQueryParamsToUrl(url: string, options: RequestOptions) : string {
		if (options.queryParams) {
			if (!url.includes('?')) {
				url += '?';
			} else if (!url.endsWith('?') && !url.endsWith('&')) {
				url += '&'
			}
			if (this.addRandom) {
				url += this.addRandom + '=' + (Math.random () * 900000 + 100000 | 0) + '&';
			}
			if (typeof(options.queryParams) === 'string') {
				url += options.queryParams;
			} else {
				url += this.formEncodedString(options.queryParams);
			}
		} else if (this.addRandom) {
			if (!url.includes('?')) {
				url += '?';
			} else if (!url.endsWith('?') && !url.endsWith('&')) {
				url += '&'
			}
			url += this.addRandom + '=' + (Math.random () * 900000 + 100000 | 0);
		}
		return url;
	}

	private formEncodedString(obj: {[key:string]:string}) {
		let pairs: string[] = [];
		for (let k in obj) {
			pairs.push(encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]));
		}
		return pairs.join('&');
	}

	private getBody(options: RequestOptions) : BodyType|null {
		if (options.body) {
			if (typeof(options.body) === 'string') {
				return { data: options.body };
			} else {
				return options.body;
			}
		} else if (options.bodyJson) {
			return {
				data: JSON.stringify(options.bodyJson),
				type: 'text/json'
			};
		} else if (options.bodyForm) {
			return {
				data: this.formEncodedString(options.bodyForm),
				type: 'application/x-www-form-urlencoded'
			};
		}
		return null;
	}

	public get(url: string, options: RequestOptions|null, callback: (httpCode: number, response: string) => void) {
		options = Object.assign(options || {}, { method: 'GET' });
		url = this.do(options, url, callback);
	}

	public post(url: string, options: RequestOptions|null, callback: (httpCode: number, response: string) => void) {
		options = Object.assign(options || {}, { method: 'POST' });
		url = this.do(options, url, callback);
	}

	public do(options: RequestOptions | null, url: string, callback: (httpCode: number, response: string) => void) {
		let body: BodyType | null = null;
		let headers: { [key: string]: string; } = {};
		if (options) {
			url = this.addQueryParamsToUrl(url, options);
			if (options.headers) {
				headers = options.headers;
			}
			body = this.getBody(options);
			if (body && body.type) {
				headers['Content-type'] = body.type;
			}
		}
		var obj = new XMLHttpRequest();

		obj.addEventListener('readystatechange', () => {
			if (obj.readyState === 4) {
				callback(obj.status, obj.responseText);
			}
		}, false);
		obj.open(options?.method || 'GET', url, true);
		for (let k in headers) {
			obj.setRequestHeader(k, headers[k]);
		}
		if (body && body.data) {
			obj.send(body.data);
		}
		else {
			obj.send();
		}
		return url;
	}
}

const ajax = new Ajax();



function elem(opts: {
	tag?: string;
	css?: {[key: string]: string};
	events?: {[key: string]: (event: Event) => void};
	children?: Array<HTMLElement>;
	appendTo?: HTMLElement;
	done?: (element: HTMLElement) => void;
	innerText?: string;
	innerHTML?: string;
} & {[key:string]:string}, callback: (element: HTMLElement) => void) {
	/*
		tag: 'div',
		css: {
		},
		events: {
		},
		children: [
			elem ({..})
		],
		appendTo: document.body,
		done: function (self) {...}
	*/
	var el = document.createElement (opts.tag || 'div');
	if (opts.innerText) el.innerText = opts.innerText;
	if (opts.innerHTML) el.innerHTML = opts.innerHTML;
	if (opts.css) {
		for (let k in opts.css) {
			el.style.setProperty(k, opts.css[k]);
		}
	}
	if (opts.events) {
		for (var k in opts.events) {
			el.addEventListener (k, opts.events[k], false);
		}
	}
	if (opts.children) {
		for (var i = 0; i < opts.children.length; i++) {
			el.appendChild (opts.children[i]);
		}
	}
	var apto = null;
	for (let opt in opts) {
		switch (opt) {
			case 'css':
			case 'events':
			case 'children':
			case 'appendTo':
			case 'done':
			case 'innerText':
			case 'innerHTML':
				break;
			default:
				if (opts[opt] !== null) el.setAttribute(opt, opts[opt]);
		}
	}
	if (opts.appendTo) opts.appendTo.appendChild (el);
	if (opts.done) callback = opts.done;
	if (callback) callback (el);
	return el;
}


elem.findParentByTag = function (el: HTMLElement, tag: string) {
	var ret = null;
	tag = tag.toLowerCase ();
	while (el !== document.body && el.parentElement) {
		if (el.tagName && el.tagName.toLowerCase () === tag) {
			return el;
		}
		el = el.parentElement;
	}
	return null;
};
