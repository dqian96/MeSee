angular.module('app', ['rzModule'])
    .controller('MainController', function($scope, Backend) {

        $scope.show_transit = false;
        $scope.show_school_regions = false;

        $scope.toggleTransit = function() {
            $scope.transitLayer.setMap($scope.show_transit ? $scope.map : null);
        };


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
                name: "Average Shop Ratings",
                value: 4,
                options: {
                    floor: 1,
                    ceil:5,
                    showSelectionBar: true,
                }
            },
            {
                name: "General Sentiment",
                value: 4,
                options: {
                    floor: 1,
                    ceil:5,
                    showSelectionBar: true,
                }
            }
        ];

        // Recursive function to find shit ez
        $scope.findRegions = function (nb, j, max, callback) {
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
                                $scope.new_arr.push({hood: nb, data: succ_data});

                                j++;
                                $scope.search_progress = Math.round(j/max*100);
                                console.log(j/max);

                                if (j>=max){
                                    console.log("yup or nup");
                                    callback($scope.new_arr);
                                } else {
                                    t_arr = [{hood: nb, data: succ_data}];
                                    var t_region = $scope.hood_arr_clone.splice(Math.floor(Math.random()*$scope.hood_arr_clone.length),1)[0];
                                    $scope.findRegions(t_region, j, max, callback);
                                    console.log(t_region.getProperty('HOOD'));
                                }

                            },function(fail_data){
                                console.log(fail_data);
                                var t_region = $scope.hood_arr_clone.splice(Math.floor(Math.random()*$scope.hood_arr_clone.length),1)[0];
                                $scope.findRegions(t_region, j, max, callback);
                            });
                    } else {
                        // keep going
                        window.alert('No results found');
                        var t_region = $scope.hood_arr_clone.splice(Math.floor(Math.random()*$scope.hood_arr_clone.length),1)[0];
                        $scope.findRegions(t_region, j, max, callback);
                    }
                } else {
                    // Keep going
                    window.alert('Geocoder failed due to: ' + status);
                    var t_region = $scope.hood_arr_clone.splice(Math.floor(Math.random()*$scope.hood_arr_clone.length),1)[0];
                    $scope.findRegions(t_region, j, max, callback);
                }
            });
        }

        $scope.findNeighbourhood = function(){
            $scope.search_progress = 0;
            $scope.search_results = null;
            $scope.hood_arr_clone = neighbourhood_array.slice(0);
            $scope.new_arr = [];
            var t_region = $scope.hood_arr_clone.splice(Math.floor(Math.random()*$scope.hood_arr_clone.length),1)[0];

            $scope.search_results = $scope.findRegions(t_region, 0, 6,
                function(arr_succ){
                    console.log(arr_succ);

                    arr_succ.sort(function(a,b){
                        var t_weight = $scope.prefs[0].value + 
                            $scope.prefs[1].value + 
                            $scope.prefs[2].value;

                        var a_total = a.data.crimeF*(100/25)*$scope.prefs[0].value/t_weight + 
                            a.data.ratingsData*(100/70)*$scope.prefs[1].value/t_weight + 
                            a.data.indicoF*(100/5)*$scope.prefs[2].value/t_weight;

                            a.data.weighted_rating = Math.round(a_total);

                        var b_total = b.data.crimeF*(100/25)*$scope.prefs[0].value/t_weight + 
                            b.data.ratingsData*(100/70)*$scope.prefs[1].value/t_weight + 
                            b.data.indicoF*(100/5)*$scope.prefs[2].value/t_weight;

                            b.data.weighted_rating = Math.round(b_total);

                        return b_total - a_total;
                    });

                    $scope.search_results = arr_succ;
                });
        };

        /* MAP */
        var neighbourhood_array = [];
        $scope.search_suggestions = [];

        $scope.viewNeighbourhood = function(nb){

            // kills all markers
            for (var i = 0; i < $scope.markers.length; i++) {
              $scope.markers[i].setMap(null);
            }

            $scope.loading = true;
            $scope.map.data.revertStyle();
            $scope.selected_region = {
                name: nb.getProperty("HOOD"),
                number: nb.getProperty("HOODNUM"),
                map_obj: nb
            };
            $scope.selected_region_info = null;
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

                                var t_weight = $scope.prefs[0].value + 
                                    $scope.prefs[1].value + 
                                    $scope.prefs[2].value;
                                var t_total = succ_data.crimeF*(100/25)*$scope.prefs[0].value/t_weight + 
                                    succ_data.ratingsData*(100/70)*$scope.prefs[1].value/t_weight + 
                                    succ_data.indicoF*(100/5)*$scope.prefs[2].value/t_weight;
                                succ_data.weighted_rating = Math.round(t_total);
                                $scope.selected_region_info = succ_data;

                            },function(fail_data){
                                console.log(fail_data);
                                $scope.loading = false;

                                $scope.selected_region_info = fail_data;
                            });
                    } else {
                        window.alert('No results found');
                        $scope.loading = false;
            
                    }
                } else {
                    $scope.loading = false;
                    window.alert('Geocoder failed due to: ' + status);
                }
            });

            if ($scope.show_school_regions){
                var request = {
                    location: latlng,
                    type: 'school',
                    radius: 2000
                };
                $scope.map_service.nearbySearch(request, function(results, status){
                    if (status == google.maps.places.PlacesServiceStatus.OK) {

                        console.log(results);
                        for (var i = 0; i < results.length; i++) {
                           $scope.createMarker(results[i]);
                        }
                    }
                });
            }
            

            $scope.map.panTo(new google.maps.LatLng(lat, lng));
            console.log($scope.selected_region);

            $scope.search_string = "";
        };

        $scope.createMarker = function(place){
            var school_icon = {
                url : "img/school-icon.png",
                scaledSize : new google.maps.Size(32, 32)
            };
            var placeLoc = place.geometry.location;
            var marker = new google.maps.Marker({
              map: $scope.map,
              position: place.geometry.location,
              icon: school_icon
            });
            google.maps.event.addListener(marker, 'click', function () {
              $scope.infowindow.setContent(place.name);
              $scope.infowindow.open(map, this);
            });
            $scope.markers.push(marker);
        }

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
            $scope.transitLayer = new google.maps.TransitLayer();
            $scope.map_service = new google.maps.places.PlacesService($scope.map);
            $scope.infowindow = new google.maps.InfoWindow();
            $scope.markers = [];

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