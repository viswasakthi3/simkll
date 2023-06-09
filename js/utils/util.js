function log(t) {
	let bkg = chrome.extension.getBackgroundPage();
	if (!bkg.debug) return;

	function padStr(i, deep) {return deep == undefined?(i < 10) ? "0" + i : "" + i:(i < 10 ? "00" + i : (i < 100 ? "0" + i : "" + i));}

	let temp = new Date(),
		dateStr = padStr(temp.getHours())+':'+padStr(temp.getMinutes())+':'+padStr(temp.getSeconds()+'.'+padStr(temp.getMilliseconds(), true));

	if (typeof t === 'object') {
		bkg.console.log(dateStr);
		bkg.console.log(t);
	} else bkg.console.log(dateStr + ', ' + t);
}

Object.size = function(obj) {
	let size = 0, key;
	for (key in obj) {if (obj.hasOwnProperty(key)) size++;}
	return size;
};
