// localstorage interface
let storageClass = function (){
	function setSetting(name, val, callback){
	  	log('setting ' + name + ' = ' + val);
	  	let o = {}; o[name] = val;
		chrome.storage.sync.set(o, callback);
	}

	function getSetting(name, callback) {
		chrome.storage.sync.get(name, items=>{
			if (typeof name === 'string'){
				log('got storage ' + name + ': ' + items[name]);
				callback(typeof name === 'array'?items:items[name]);
			}else{
				log('got storage object ');
				callback(items);
			}

		});
	}
	function clear() {chrome.storage.sync.clear();}
	// LOCAL STORAGE
	function setLocal(name,value){localStorage.setItem(name,value);}
	function getLocal(name){return localStorage.getItem(name);}
	// public functions
	return {
		clear,
		set: (name, value, onSave)=>setSetting(name, value, onSave),
		get: (name, onGet) => getSetting(name, onGet),
		setL: (name,value) =>setLocal(name,value),
		getL: name=>getLocal(name)
	};
};