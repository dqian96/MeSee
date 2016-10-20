angular.module('app')
.service('Backend', function($http) {

	return {
		getInfoByRegion: function(addr_string, region_num, successcallback, failurecallback) {


			addr_string = addr_string.replace(/,/gmi, "").replace(/ /gmi, "-");

			addr_string = addr_string.replace("Toronto-ON-", "");
			addr_string = addr_string.replace("/(^\d{5}$)|(^\d{5}-\d{4}$)/", "");

			$http.get('http://localhost:3000/yelp/' + addr_string + "/" + region_num, 
				{timeout: 30000})
				.then(function(success) {
					console.log(success);
					successcallback(success.data);
				}, function(fail) {
					console.log(fail);
					failurecallback(fail);
			});
		}
	};
});