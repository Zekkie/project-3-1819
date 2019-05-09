const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const Observer = require("./bin/Observer.js");

class BusinessSocket{
	constructor(id,name) {
		this.id = id;
		this.name = name;
		this.ns = io.of("/business/"+this.id);

		
	};

	notify(u) {
		this.ns.emit("userLike",u)
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


const businessObserver = new Observer();


for(let i = 0; i < business.length; i++) {
	businessObserver.subscribe(new BusinessSocket(business[i].id,business[i].name));
};


console.log(businessObserver.observers[0].ns)


const likes = [];
const dislikes = [];

const likeBusiness = (uid,bid) => {
	const obj ={
		id: likes[likes.length-1] ? likes[likes.length-1].id+1 : 0,
		uid:uid,
		bid:bid,
		approved: false
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
			cb("out of business");
		};
	};
};

app.get("/user", (req,res) => {
	const id =+ req.query.id;
	const singleUser = user.find(i => {
		return i.id === id;
	}) 

	if(singleUser) {
		res.send(JSON.stringify(singleUser));
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
	
});
