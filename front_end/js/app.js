angular.module('app', ['rzModule'])
    .controller('MainController', function($scope, Backend) {

        /* OPTIONS */

        $scope.prefs = [
            {
                name: "Safety",
                value: 4,
                options: {
                    floor: 1,
                    ceil:5,
                    showSelectionBar: true,
                }
            },
            {
                name: "Local Businesses",
                value: 4,
                options: {
                    floor: 1,
                    ceil:5,
                    showSelectionBar: true,
                }
            },
            {
                name: "Transit",
                value: 4,
                options: {
                    floor: 1,
                    ceil:5,
                    showSelectionBar: true,
                }
            }
        ];

        $scope.findNeighbourhood = function(){
            // Fetch 10 random places
        };

        /* MAP */
        var neighbourhood_array = [];
        $scope.search_suggestions = [];

        $scope.updateSearchSuggestions = function () {
            $scope.search_suggestions = [];
            if ($scope.search_string !== "") {            
                neighbourhood_array.forEach(function(region){
                    if (region.getProperty("HOOD").toLowerCase().indexOf($scope.search_string) != -1){
                        $scope.search_suggestions.push(region);
                    }
                });
            }
        };

        $scope.viewNeighbourhood = function(nb){
            $scope.error = false;
            $scope.loading = true;
            $scope.map.data.revertStyle();
            $scope.selected_region = {
                name: nb.getProperty("HOOD"),
                number: nb.getProperty("HOODNUM"),
                map_obj: nb
            };
            $scope.map.data.overrideStyle($scope.selected_region.map_obj, {fillColor: '#4ccaff'});
            $scope.map.data.overrideStyle($scope.selected_region.map_obj, {strokeColor: '#4ccaff'});
            $scope.map.data.overrideStyle($scope.selected_region.map_obj, {strokeWeight: 3});
            $scope.map.data.overrideStyle($scope.selected_region.map_obj, {fillOpacity: 0.4});

            var temp_polys = nb.getGeometry();
            var i = 0, lat = 0, lng = 0;

            temp_polys.forEachLatLng(function(latlng){
                lat+=latlng.lat();
                lng+=latlng.lng();
                i++;
            });

            lat = lat/i;
            lng = lng/i;

            var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};

            $scope.geocoder.geocode({'location': latlng}, function(results, status) {
                if (status === 'OK') {
                    if (results[0]) {  
                        console.log(results[0]);
                        Backend.getInfoByRegion(
                            results[0].formatted_address,
                            nb.getProperty("HOODNUM"),
                            function(succ_data){
                                console.log(succ_data);
                                $scope.loading = false;
                                $scope.selected_region_info = succ_data;
                            },function(fail_data){
                                console.log(fail_data);
                                $scope.loading = false;
                                $scope.selected_region_info = fail_data;
                            });
                    } else {
                        window.alert('No results found');
                        $scope.loading = false;
                        $scope.error = true;
                    }
                } else {
                    $scope.loading = false;
                    $scope.error = true;
                    window.alert('Geocoder failed due to: ' + status);
                }
            });

            $scope.map.panTo(new google.maps.LatLng(lat, lng));
            console.log($scope.selected_region);

            $scope.search_string = "";

            
        };

        // initialize maps
        function initMap() {

            $scope.search_string = "";

            $scope.map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: 43.70, lng: -79.3832},
                zoom: 12,
                streetViewControl: false,
                mapTypeControl: false,
                styles: 
                [{"featureType":"landscape","stylers":[{"hue":"#FFBB00"},{"saturation":43.400000000000006},{"lightness":37.599999999999994},{"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#FFC200"},{"saturation":-61.8},{"lightness":45.599999999999994},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":51.19999999999999},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":52},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#0078FF"},{"saturation":-13.200000000000003},{"lightness":2.4000000000000057},{"gamma":1}]},{"featureType":"poi","stylers":[{"hue":"#00FF6A"},{"saturation":-1.0989010989011234},{"lightness":11.200000000000017},{"gamma":1}]}]
            });

            $scope.geocoder = new google.maps.Geocoder;

            $scope.map.data.setStyle({
                strokeWeight: 1,
                fillOpacity: 0.1,
                strokeOpacity: 0.8,
                strokeColor: '#454545',
            });

            $scope.map.data.loadGeoJson('lib/neighbourhood_data.json', {}, function(region_arr){
                neighbourhood_array = region_arr;
            });

            /****************************
                A whole lotta listeners 
             ****************************/
            $scope.map.data.addListener('mouseover', function(event) {
                $scope.map.data.revertStyle();
                $scope.map.data.overrideStyle(event.feature, {strokeWeight: 2});
                $scope.map.data.overrideStyle(event.feature, {fillOpacity: 0.3});

                if ($scope.selected_region){
                    $scope.map.data.overrideStyle($scope.selected_region.map_obj, {fillColor: '#4ccaff'});
                    $scope.map.data.overrideStyle($scope.selected_region.map_obj, {strokeColor: '#4ccaff'});
                    $scope.map.data.overrideStyle($scope.selected_region.map_obj, {strokeWeight: 3});
                    $scope.map.data.overrideStyle($scope.selected_region.map_obj, {fillOpacity: 0.4});
                }
                $scope.$apply(function(){
                    $scope.hovered_region = event.feature.getProperty('HOOD');
                });
            });

            $scope.map.data.addListener('mouseout', function(event) {
                $scope.map.data.revertStyle();
                $scope.$apply(function(){
                    $scope.hovered_region = "";
                });
                if ($scope.selected_region){
                    $scope.map.data.overrideStyle($scope.selected_region.map_obj, {fillColor: '#4ccaff'});
                    $scope.map.data.overrideStyle($scope.selected_region.map_obj, {strokeColor: '#4ccaff'});
                    $scope.map.data.overrideStyle($scope.selected_region.map_obj, {strokeWeight: 3});
                    $scope.map.data.overrideStyle($scope.selected_region.map_obj, {fillOpacity: 0.4});
                }
            });

            $scope.map.data.addListener('click', function(event) {
                $scope.map.data.revertStyle();
                $scope.$apply($scope.viewNeighbourhood(event.feature));
            });

            console.log($scope.map.data);
        }

        initMap();
    }
);

angular.module('app')
    .factory('backend', function($http) {

    }
);