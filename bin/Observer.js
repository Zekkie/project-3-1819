class Observer {
	constructor() {
		this.observers = [];
	};

	subscribe(o) {
		this.observers.push(o);
	};

	notify(d,u) {
		for(let i = 0; i < this.observers.length; i++) {
			if(this.observers[i].id === d) {
				this.observers[i].notify(u);
			};
		};
	};
};

module.exports = Observer;