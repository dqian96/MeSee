angular.module('app')
.service('Backend', function($http) {

	return {
		getInfoByRegion: function(addr_string, region_num, callback) {
			$http.get(':3000/yelp/' + addr_string + "/" + region_num)
				.then(function(success) {
					console.log(success);
					callback();
				}, function(fail) {
					console.log(fail);
					callback();
			});
		}
	};
});