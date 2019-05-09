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

module.exports = {likeFilter};