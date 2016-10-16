angular.module('app')
.service('Backend', function($http) {

	return {
		getInfoByRegion: function(addr_string, region_num, successcallback, failurecallback) {


			addr_string = addr_string.replace(/,/gmi, "").replace(/ /gmi, "-");

			$http.get('http://localhost:3000/yelp/' + addr_string + "/" + region_num, 
				{timeout: 5000})
				.then(function(success) {
					console.log(success);
					successcallback(success.data);
				}, function(fail) {
					console.log(fail);
					failurecallback(fail);
			});
		},
		getInfoBySearch: function(queries, successcallback, failurecallback) {

			addr_string = addr_string.replace(/,/gmi, "").replace(/ /gmi, "-");

			$http.get('http://localhost:3000/yelp/' + addr_string + "/" + region_num, 
				{timeout: 4000})
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