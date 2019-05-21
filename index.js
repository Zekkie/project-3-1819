const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const Observer = require("./bin/Observer.js");

app.use(express.static("static"));


class BusinessSocket{
	constructor(id,name) {
		this.id = id;
		this.name = name;
		this.ns = io.of("/business/"+this.id);
		console.log("hi",this.id)
		this.ns.on("connect", (s) => {
			s.on("match",d => {
				match.push({
					id: match[match.length-1] ? match[match.length-1].id+1 : 0,
					business_id: this.id,
					user_id: d.userId
				});

				const foundMatch = match.find(i => {
					return i.business_id === this.id && i.user_id === d.userId
				});

				const matchUser = userObserver.observers.find(u => {
					return u.id === d.userId
				})

				
				if(!matchSockets.find(i =>{return i.id === foundMatch.id})) {
					matchSockets.push(new MatchSocket(foundMatch.id));
				}
				
				this.ns.emit("newmatch",{id:foundMatch.id,user: user.find(u =>{return u.id === d.userId})});
				matchUser.match({id:foundMatch.id,business:business.find(b =>{return b.id === this.id})});
			});
		});
	};

	notify(u) {
		this.ns.emit("userLike",u)
	};
};

class MatchSocket {
	constructor(id) {
		this.id = id;
		this.ns = io.of("/match/"+this.id);

		this.ns.on("connect", socket => {
			console.log("new connection")
			socket.on("message", message => {
				socket.broadcast.emit("message", message);
			});
		});
	};
};

class UserSocket{
	constructor(id,name) {
		this.id = id;
		this.name = name;
		this.ns = io.of("/user/"+this.id);

		
	};

	match(m) {
		this.ns.emit("newmatch",m)
	}

	notify(u) {
		this.ns.emit("businessLike",u)
	};
};

const user = [
	{
		id:0,
		name:"Zekkie",
		skills: ["Node","Javascript","Css","Html"]
	}
]

const business = [
	{
		id:0,
		name:"Facebook",
	},
	{
		id:1,
		name:"Twitter",
	},
	{
		id:2,
		name: "Google"
	}
]

const match = [];

const matchSockets = [];

const businessObserver = new Observer();
const userObserver = new Observer();


for(let i = 0; i < business.length; i++) {
	businessObserver.subscribe(new BusinessSocket(business[i].id,business[i].name));
};


for(let i = 0; i < user.length; i++) {
	userObserver.subscribe(new UserSocket(user[i].id,user[i].name));
};


const likes = [];
const dislikes = [];

const likeBusiness = (uid,bid) => {
	const obj ={
		id: likes[likes.length-1] ? likes[likes.length-1].id+1 : 0,
		uid:uid,
		bid:bid,
	} 
	likes.push(obj);
}

const dislikeBusiness = (uid,bid) => {
	const obj ={
		id: dislikes[dislikes.length-1] ? dislikes[dislikes.length-1].id+1 : 0,
		uid:uid,
		bid:bid,
	} 
	likes.push(obj);
}

const likeFilter = (uid,bid) => {
	const hasBusiness = [];

	for(let i = 0; i < likes.length; i++) {
		if(likes[i].uid === uid) {
			for(let j = 0; j < business.length; j++) {
				if(likes[i].bid === business[j].id) {
					hasBusiness.push(business[j]);
				};
			};
		};
	};

	for(let i = 0; i < dislikes.length; i++) {
		if(dislikes[i].uid === uid) {
			for(let j = 0; j < business.length; j++) {
				if(dislikes[i].bid === business[j].id) {
					hasBusiness.push(business[j]);
				};
			};
		};
	};

	return hasBusiness;
}

const newBusiness = (uid,bid,cb) => {
	const hasBusiness = likeFilter(uid,bid);
	for(let i = 0; i < business.length; i++) {
		if(!hasBusiness.includes(business[i])) {
			cb(business[i]);
			break;
		}else if(i === business.length - 1) {
			cb({status:null});
		};
	};
};

app.get("/user", (req,res) => {
	let id =+ req.query.id;

	id = parseInt(id);
	const singleUser = user.find(i => {
		return i.id === id;
	}) 

	if(singleUser) {
		res.sendfile(__dirname+"/static/user.html");
	}else {
		res.send("user not found biatch")
	}
});

app.get("/business", (req,res) => {
	const id =+ req.query.id;
	const singleBusiness = business.find(i => {
		return i.id === id;
	}) 

	if(singleBusiness) {
		res.sendfile(__dirname+"/static/business.html");
	}else {
		res.send("user not found biatch")
	}
});


app.get("/api/get/user", (req,res) => {
	let {id} = req.query;
	id = parseInt(id);
	const singleUser = user.find(i => {
		return i.id === id;
	});

	res.send(JSON.stringify(singleUser));
});

app.get("/api/get/business", (req,res) => {
	let {id} = req.query;
	id = parseInt(id);
	const singleUser = business.find(i => {
		return i.id === id;
	});
	res.send(JSON.stringify(singleUser));
});

app.post("/api/post/likeBusiness", (req,res) => {
	let {uid,bid} = req.query;
	uid = parseInt(uid)
	bid = parseInt(bid)
	const userLiked = user.find(i => {
		return i.id === uid;
	})
	businessObserver.notify(bid,userLiked);
	likeBusiness(uid,bid);
	newBusiness(uid,bid,(m) => {
		res.send(JSON.stringify(m));
	});
});

app.post("/api/post/dislikeBusiness", (req,res) => {
	let {uid,bid} = req.query;

	uid = parseInt(uid);
	bid = parseInt(bid);

	dislikeBusiness(uid,bid)
	newBusiness(uid,bid,(m) => {
		res.send(JSON.stringify(m));
	});
});


server.listen(9000, () => {
	console.log("running")
});
