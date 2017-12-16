(function() {
        'use strict';
        angular
            .module('app.dashboard')
            .controller('nvDashboardController', nvDashboardController);
        nvDashboardController.$inject = [
            '$scope',
            '_',
            '$rootScope',
            'triBreadCumbMenu',
            'DashboardService',
            '$timeout',
            '$interval',
            '$mdDialog',
            '$document',
            '$state',
            'globalServiceCommon',
            '$window',
            '$filter',
            'UrlConstantsdashboard',
            '$element',
            'leafletData',
            'BaseMapLayerServiceLyrs',
            'LayersMapsServiceLyrs',
            'jcpGlobalServiceCommon',
            '$mdSidenav',
            'NVDashboardService'
        ];

        function nvDashboardController(
            $scope,
            _,
            $rootScope,
            triBreadCumbMenu,
            DashboardService,
            $timeout,
            $interval,
            $mdDialog,
            $document,
            $state,
            globalServiceCommon,
            $window,
            $filter,
            UrlConstantsdashboard,
            $element,
            leafletData,
            BaseMapLayerServiceLyrs,
            LayersMapsServiceLyrs,
            jcpGlobalServiceCommon,
            $mdSidenav,
            NVDashboardService
        ) {
            var vm = this;
            var that = vm;
            vm.searchLocation = "All";
            vm.chartData;
            jcpGlobalServiceCommon.showLoaderOnPopup("Loading");

            vm.nvData = {
                search: {"name": "" , "id":"3438"},
                searches : [],
                operator : "Smartfren",
                operators : [],
                technology : "LTE",
                technologies : [],
                band : "2.4",
                bands : [],
                dateType : "DAY",
                dateRange :  null,
                endDate : 1512066600000,
                formatDateView : "",
                enableFilter : true,
                isApplyDisable : false,
                topLocationKpi : "avgDlRate",
                lastValueDl : 0 ,
                lastValueUl : 0,
                lastValueSignal : 0 ,
                lastValueQuality : 0,
                totalUser : 0,
                isCallAnalytics: false,
                locationMap : null , 
                mapid : "" ,
                starChecked : [],
                TopLocKpi : "avgDlRate",
                currentdate :  moment().subtract('day' , 1).format("DD-MM-YYYY"),

            };
               /**date Range***/
            
            vm.nvData.dateRange = { 
				//dateStart: moment().subtract('day' , 1).valueOf(),	//.format("DD-MM-YYYY"),
				//dateEnd:  moment().subtract('day' , 1).valueOf(),	//.format("DD-MM-YYYY"),
                selectionCustom: true,
	            showTemplate: false,
	            fullscreen: false,
	            showMonth: true,
	            showWeek: true,
	            showTime: false,
	            showDay: true,
	            firstDayOfWeek: 1,
	            currentWeekDisabled: true,
	            selectedTemplate: 'DAY'
            };
            

            vm.defaultNVData = angular.copy(vm.nvData) ;
            
            vm.getDayMonthAndDate = function(){
				var obj = vm.getNVData();
				var type = $filter('hasValue')(obj.dateRange.selectionMode) ? obj.dateRange.selectionMode : "DAY";
				var startDate =  $filter('hasValue')(obj.dateRange.dateStart) ? obj.dateRange.dateStart : moment().subtract('day' , 1).valueOf() ;
				var endDate =  $filter('hasValue')(obj.dateRange.dateEnd) ? obj.dateRange.dateEnd : moment().subtract('day' , 1).valueOf();
				var series  = [];
				
				switch(type){
					case "DAY":
						for(var i = 1 ; i <= 7 ; i++){
							var temp = moment(endDate).subtract( 'day' , 7 - i ).format("DD MMM");
							series.push(temp);
						}
						type = "Previous Days" ;
					break ;
					case "WEEK":
						for(var i = 1 ; i <= 7 ; i++){
							var temp = moment(endDate).subtract('week' , 7 - i).week();
							series.push("week " + temp);
						}
						type =  "Previous Weeks" ;
					break ;
					case "MONTH":
						for(var i = 1 ; i <= 7 ; i++){
							var temp = moment(endDate).subtract('month' , 7 - i).format("MMM");
							series.push(temp);
						}
						type = "Previous Months" ;
					break ;
					
				}
				
				return { "type" : type , "xAxisSeries" : series };
			}

            vm.getNVData = function(key) {
                if ($filter('hasValue')(key)) {
                    return vm.nvData[key];
                } else {
                    return vm.nvData;
                }
            }

            vm.setNVData = function(key, value) {
                vm.nvData[key] = value;
            }
            
            vm.getFormatDateView = function() {
				var obj = vm.getNVData();
				var startDate = obj.dateRange.dateStart ;
				var endDate = obj.dateRange.dateEnd ;
                var dateFormat = moment(startDate).format("DD MMM") + " - " + moment(endDate).format("DD MMM YYYY");
                vm.setNVData("formatDateView" ,dateFormat );
            }
            
            vm.getFormatDateView();
            
            vm.initNVDashboard = function() {
                vm.getFilterParams();
                vm.getNVChartData();
            }

            vm.reset = function() {
				vm.nvData =  angular.copy(vm.defaultNVData ) ; 
				 vm.getFilterParams();
            }

            vm.apply = function() {
                vm.getNVChartData();
            }

            vm.locationChange = function(locationName) {
                setTimeout(function() {
					 var obj = vm.getNVData();
                    var jsonStr = ['GeographyL1', 'GeographyL2', 'GeographyL3', 'GeographyL4'];
                    var url = window.context + window.rest + 'AdvanceSearch/getAdvanceSearchByTypeList/' + locationName;
                    globalServiceCommon.sendPOSTRequest(url, jsonStr).then(function(response) {
						vm.nvData.searches =[];
                        var data = response.data;
                        vm.nvData.searches =data;
                      
						
                        
                    });
                }, 100);

            }
            
           

            vm.checkFormValidation = function() {
                if (!$filter('hasValue')(vm.nvData.operator) || !$filter('hasValue')(vm.nvData.technology)) {
                     vm.setNVData("isApplyDisable" , true );
                } else {
                   vm.setNVData("isApplyDisable" , false );
                }
            }

            vm.getFilterParams = function() {
                var obj = vm.getNVData();
                var url = window.context + window.rest + "NVDashboard/getAllTechnologyOperatorBand";
                globalServiceCommon.sendGETRequest(url)
                    .then(function(result) {
                        var data = result.data;
                        if($filter("hasValue")(data)){
							vm.setNVData("operators" , data.operatorList );
							vm.setNVData("technologies" , data.technologyList );
							vm.setNVData("bands" , data.bandList );
						}
                    }).catch(function(err) {
                        console.log("error:", err);
                    })
            };
            
          
             vm.getDataForChart = function(data){
				var keys = _.keys(data);
				var series = [];
				for(var i = 1 ; i <= keys.length ; i++ ){
					var temp  = data["value"+i] ;
					if($filter("hasValue")(temp)){
						temp = parseFloat(temp) ;
						temp = Math.round(temp *100)  / 100 ;
					}
					series.push(temp);
				}
				return series ; 
			}

            
			vm.initializeMap = function(){
				angular.extend(vm, {
								center: {
									lat: 22.475420,
									lng: 77.901290,
									zoom: 2
								},
								layers: {},
								defaults: {
									fadeAnimation: false,
									zoomControl: false
								},
								callAnalyticsCenter: {
									lat: 20.5937,
									lng: 78.9629,
									zoom: 5
								},
								callAnalyticslayers: {},
								callAnalyticsdefaults: {
									fadeAnimation: false,
									zoomControl: false,
									scrollWheelZoom: false
								}
							});
							
							vm.topMapLoctions = {};
							var mapid = "TopLocationmap";
							vm.setNVData("mapid" , mapid) ;
							leafletData.getMap(mapid).then(function(currentMap) {
								vm.setNVData("locationMap" , currentMap) ;
								var map = vm.getNVData("locationMap");
								map.invalidateSize()
								map.baseMapService = new BaseMapLayerServiceLyrs(mapid, {
									'initLayers': 'googleRoadmapDarkGray'
								});
								map.easelCanvas = new LayersMapsServiceLyrs.CanvasLayer(mapid);
								map.zoomControl = new LayersMapsServiceLyrs.ZoomControl(mapid, {
									position: 'bottomright'
								});
								map.options.minZoom = 2;
								
							});
			}
			
			vm.initializeMap();

            vm.getNVTopSevenData = function() {
				 var obj = vm.getNVData();
				 var endDate = obj.dateRange.dateEnd;
				 endDate = moment(endDate).format("DD-MM-YYYY");
				 var url = window.context + window.rest + "NVDashboard/getTopSevenDataByLocation?kpi="+ obj.TopLocKpi+"&advancedSearchId="  + obj.search.id + "&endDate=" + endDate + "&callType=" + obj.dateType + "&band=" + obj.band + "&technology=" + obj.technology + "&operator=" + obj.operator;
                   globalServiceCommon.sendGETRequest(url)
                    .then(function(result) {
						var data = result.data;
						if($filter("hasValue")(data)){
							 var map = vm.getNVData("locationMap");
							 var center = [ data[0].lat ,  data[0].lon ] ;
							 map.setView(center , 4);
								 /* Top Location Map */
								if($filter('hasValue')(map.BubbleRippleLayers)){
										map.removeLayer(map.BubbleRippleLayers) ;
								}
								var series  =[];
								for(var i = 0 ; i < data.length ; i++){
									var temp = {};
									temp.lat = data[i].lat;
									temp.lng = data[i].lon;
									series.push(temp) ;
								}
								var config = {
									'popup': {
										className: 'leaflet-topology-popup',
										maxWidth: 340,
										minWidth: 230,
										closeButton: false
									}
								};
								var mapid = vm.getNVData("mapid") ;
								vm.topMapLoctions.BubbleRippleLayers = new NVDashboardService.BubbleRippleLayers(mapid , series);
								vm.topMapLoctions.BubbleRippleLayers.addLayer({}, config);
							}	
					});
						
			}
			
            vm.getNVUserCountData = function() {
				 var obj = vm.getNVData();
				 var endDate = obj.dateRange.dateEnd ;
				 endDate = moment(endDate).format("DD-MM-YYYY");
				  var url = window.context + window.rest + "NVDashboard/getNvDashboardUserCountByDateAndLocation?advancedSearchId="  + obj.search.id + "&endDate=" + endDate + "&callType=" + obj.dateType + "&band=" + obj.band + "&technology=" + obj.technology + "&operator=" + obj.operator;
					globalServiceCommon.sendGETRequest(url)	
                    .then(function(result) {
						console.log("user counts");
						 var data = result.data;
						 var totalUser = data.activePassive.totalUser; 
						 
						  vm.setNVData("totalUser" , $filter('hasValue')(totalUser) ? totalUser : "-" );
							var config = {
								'name': ['Work Order', 'Campaign'],
								'color': ['#3FBDF7', '#6A8EE6']
							}
							vm.chartPassiveSample = vm.configurePieChart(data.consumerEnterpriseUC, config);

							config = {
								'name': ['Active', 'Passive'],
								'color': ['#FAD465', '#21C392']
							}
							vm.chartUserSegment = vm.configurePieChart(data.activePassive, config);

							config = {
								'name': ['Android', 'iOS'],
								'color': ['#99C2E0', '#9CD590']
							}
							vm.chartOperatingSystem = vm.configurePieChart(data.androidIosUC, config);
					});
			}
			
			 vm.configurePieChart = function(data, config) {
                var options = {
                    "data": [{
						
                        "name": config.name[0],
                        "y": data.user1Percent
                    }, {
                        "name": config.name[1],
                        "y": data.user2Percent
                    }],
                    "pie_colors": config.color
                    
                };
                var pieChart = new NVDashboardService.pieChartConfig(options);
                 pieChart.credits =  { enabled: false  } ; 
			     pieChart.title ={ text:'' } ; 
               
                return pieChart;
            }

			
			
			
            vm.getNVChartData = function(kpi, isexpand) {
                var obj = vm.getNVData();
				var endDate = obj.dateRange.dateEnd ;
                 endDate = moment(endDate).format("DD-MM-YYYY");
				 vm.getNVTopSevenData();
				 vm.getNVUserCountData();
				 
                if(!$filter('hasValue')(kpi)){
						kpi = [];
				}
                
                var url = window.context + window.rest + "NVDashboard/getNvDashboardDataByDateAndLocation?advancedSearchId="  + obj.search.id + "&endDate=" + endDate + "&callType=" + obj.dateType + "&band=" + obj.band + "&technology=" + obj.technology + "&operator=" + obj.operator;
                   globalServiceCommon.sendPOSTRequest(url, JSON.stringify(kpi))
                    .then(function(result) {
                        var chartData = result.data;
                        vm.setNVData("lastValueDl" , $filter('hasValue')(chartData.maxDlRate.value7) ? chartData.maxDlRate.value7 : "-" );
                        vm.setNVData("lastValueUl" , $filter('hasValue')(chartData.maxUlRate.value7) ? chartData.maxUlRate.value7 : "-" );
                        vm.setNVData("lastValueSinr" , $filter('hasValue')(chartData.sinr.value7) ? chartData.sinr.value7 : "-" );
                        vm.setNVData("lastValueSignal" , $filter('hasValue')(chartData.signalStrength.value7) ? chartData.signalStrength.value7 : "-" );
                        vm.setNVData("lastValueQuality" , $filter('hasValue')(chartData.quality.value7) ? chartData.quality.value7 : "-" );

                        switch (kpi) {
                            case "DOWNLOAD_SPEED":
                                vm.configureDownloadChart(chartData, isexpand);

                                break;
                            case "UPLOAD_SPEED":
                                vm.configureUploadChart(chartData, isexpand);
                                break;

                            case "SIGNAL_STRENGTH":
                                vm.configureSignalChart(chartData, isexpand);
                                break;

                            case "QUALITY":
                                vm.configureQualityChart(chartData, isexpand);
                                break;

                            case "SINR":
                                vm.configureSINRChart(chartData, isexpand);
                                break;

                            case "CONSUMEREP":
                                vm.configureLiveUserChart(chartData, isexpand);
                                break;
                            //~ case "TOTAL_USER":
                                //~ vm.totalUserChart(chartData, isexpand);
                                //~ break;
                            case "PACKET_LOSS":
                                vm.configurePacketLossChart(chartData, isexpand);
                                break;


                            case "HEALTH_INDEX":
                                vm.configureHealthChart(chartData, isexpand);
                                break;


                            case "DOWNLOAD_TIME":
                                vm.configureGoogleChart(chartData, isexpand);
                                break;

                            default:
                                vm.configureDownloadChart(chartData ,  false ,  false);
                                vm.configureSignalChart(chartData ,  false);
                                vm.configureUploadChart(chartData ,  false);
                                vm.configureQualityChart(chartData ,  false);
                                vm.configureSINRChart(chartData ,  false);
                                vm.configureLiveUserChart(chartData ,  false);
                                //vm.totalUserChart(chartData ,  false);
                                vm.configurePacketLossChart(chartData ,  false);
                                vm.configureHealthChart(chartData ,  false);
                                vm.configureGoogleChart(chartData ,  false);
                        }

                    }).catch(function(err) {
                        console.log("error:", err);
                    })

            };
            
            
            

            ///////////////////////////////////////////
            vm.configureDownloadChart = function(chartdata, isexpand) {
				
                var config = {
                    'name': ['Average DL', 'Max DL'],
                    'color': ['#41cca3', '#6c8fe1']
                }
                var data1 = vm.getDataForChart(chartdata.maxDlRate);
                var data2 = vm.getDataForChart(chartdata.avgDlRate);
                //~ for(var i = 0 ; i < data1.length ; i++ ){
					//~ data1[i] = $filter('hasValue')(data1[i]) ? parseInt(data1[i]) : 0 ; 
					//~ data2[i] = $filter('hasValue')(data2[i]) ? parseInt(data2[i]) : 0 ; 
				//~ }
				
                if(!isexpand){
					vm.chartConfigDownloadSpeed = vm.configureLineChart(data1, data2, config, isexpand);
					vm.chartConfigDownloadSpeed.options.chart.height = 170;
					var categories = vm.getDayMonthAndDate();
					vm.chartConfigDownloadSpeed.xAxis[0].categories = categories.xAxisSeries;
					vm.chartConfigDownloadSpeed.xAxis[0].title.text = categories.type;
				}else{
					vm.chartConfigExpand = [];
					vm.chartConfigExpand[0] = vm.configureLineChart(data1, data2, config, isexpand) ;
					
				}
            }

            vm.configureUploadChart = function(chartdata, isexpand) {
                var config = {
                    'name': ['Average UL', 'Max UL'],
                    'color': [' #FAD469 ', '#41CCA3']
                }
                var data1 = vm.getDataForChart(chartdata.maxUlRate);
                var data2 = vm.getDataForChart(chartdata.avgUlRate);
                 //~ for(var i = 0 ; i < data1.length ; i++ ){
					//~ data1[i] = $filter('hasValue')(data1[i]) ? parseInt(data1[i]) : 0 ; 
					//~ data2[i] = $filter('hasValue')(data2[i]) ? parseInt(data2[i]) : 0 ; 
				//~ }
				if(!isexpand){
					vm.chartConfigUploadSpeed = vm.configureLineChart(data1, data2, config, isexpand);
					vm.chartConfigUploadSpeed.options.chart.height = 170;
					var categories = vm.getDayMonthAndDate();
					vm.chartConfigUploadSpeed.xAxis[0].categories = categories.xAxisSeries;
					vm.chartConfigUploadSpeed.xAxis[0].title.text = categories.type;
				}else{
					vm.chartConfigExpand = [];
					vm.chartConfigExpand[0] = vm.configureLineChart(data1, data2, config, isexpand); ;
				}
            }
            
            vm.getMinMaxAndInterval = function(data){
				var obj = {"min" : 0,
							"max" : 100,
							"interval": 20
						  } ;
				
				if($filter("hasValue")(data)){
					obj.min = _.min(data) ;
					obj.max = _.max(data) ; 
					if(!$filter("hasValue")(obj.max)){
						obj.min  = obj.min - 50;
						obj.max = obj.min + 50 ;
					}else{
						obj.max = obj.max * 1.2 ;
						obj.min = obj.min * 0.8 ;
						obj.interval = (obj.max - obj.min ) / 5 ;
						
						obj.interval  = Math.round(obj.interval) ;
					}
				}	
				return obj ;
			}

            ////////////////////////////////
            vm.configureLineChart = function(data1, data2, config, isexpand) {
                var chartConfig = new NVDashboardService.LineChartConfig();

                chartConfig.series = [{
                    name: config.name[0],
                    color: config.color[0],
                    data: data1
                }, {
                    name: config.name[1],
                    color: config.color[1],
                    data: data2
                }];
     
                chartConfig.size = {};
                chartConfig.size.height = "170" ;
                chartConfig.options.chart.height = 170;
                chartConfig.options.chart.marginTop = 10;
                chartConfig.options.chart.spacingLeft = -8;
                chartConfig.options.legend.x = 0;
                chartConfig.credits =  { enabled: false  } ; 
                chartConfig.title ={ text:'' } ; 
               // chartConfig.options.height = 170;
                chartConfig.options.legend.itemDistance = 15;
                
                return chartConfig;
            }




            ////////////////////////
            vm.configureSignalChart = function(chartdata, isexpand) {
                var config = {
                    'color': "#9AD690"
                }
                var data = vm.getDataForChart(chartdata.signalStrength);
                 //~ console.log("ss"+data);
                 //~ for(var i = 0 ; i < data.length ; i++ ){
					//~ data[i] = $filter('hasValue')(data[i]) ? parseInt(data[i]) : 0 ; 
				//~ }
               
                if(!isexpand){
					 vm.chartConfigSignalstrength = vm.configureColumnChart(data, config);
					 vm.chartConfigSignalstrength.options.chart.height = 170;
					 var categories = vm.getDayMonthAndDate();
					 vm.chartConfigSignalstrength.xAxis[0].categories = categories.xAxisSeries;
					 vm.chartConfigSignalstrength.xAxis[0].title.text = categories.type;
				}else{
					vm.chartConfigExpand = [];
					vm.chartConfigExpand[0]  =  vm.configureColumnChart(data, config);
				}
            }
            
            vm.configureQualityChart = function(chartdata , isexpand) {

                var config = {  'color': "#9CC1DE"  } ; 
                var data = vm.getDataForChart(chartdata.quality);
				if(!isexpand){
					 vm.chartConfigQuality = vm.configureColumnChart(data, config);
					 vm.chartConfigQuality.options.chart.height = 170;
					 var categories = vm.getDayMonthAndDate();
					 vm.chartConfigQuality.xAxis[0].categories = categories.xAxisSeries;
					 vm.chartConfigQuality.xAxis[0].title.text = categories.type;
				 }else{
					 vm.chartConfigExpand = [];
					 vm.chartConfigExpand[0] = vm.configureColumnChart(data, config);
					 vm.chartConfigExpand[0].options.chart.height = 170;
				 }
            }
            
            vm.configureSINRChart = function(chartdata,  isExpand) {
                var config = {
                    'color': "#40BEF8"
                }
                var data = vm.getDataForChart(chartdata.sinr);
				if(!isExpand){
					vm.chartConfigSINR = vm.configureColumnChart(data, config);
					vm.chartConfigSINR.options.chart.height = 170;
					var categories = vm.getDayMonthAndDate();
					vm.chartConfigSINR.xAxis[0].categories = categories.xAxisSeries;
					vm.chartConfigSINR.xAxis[0].title.text = categories.type;
				}else{
					vm.chartConfigExpand = [];
					vm.chartConfigExpand[0] = vm.configureColumnChart(data, config);
					vm.chartConfigExpand.options.chart.height = 170;
				}
                
            }

            vm.configureColumnChart = function(data, config) {
				var minmax =  vm.getMinMaxAndInterval(data) ;
                var chartConfig = new NVDashboardService.ColumnChartConfig();
                chartConfig.yAxis[0].tickInterval = minmax.interval;
                chartConfig.size = {};
                chartConfig.size.height = "170" ;
                
                chartConfig.options.chart.width = 240;
                chartConfig.options.chart.height = 170;
                chartConfig.options.chart.marginTop = 10;
                chartConfig.credits =  { enabled: false  } ; 
                chartConfig.title = { text:'' } ; 
                chartConfig.yAxis[0].min = minmax.min;
                chartConfig.yAxis[0].max = minmax.max;
                chartConfig.yAxis[0].reversed = false;
                chartConfig.yAxis[0].title = {
                    text: 'dBm',
                    style: {
                        color : 'rgba(0, 0, 0, 0.87)',
                        fontWeight : "800",
                        letterSpacing :  "1",
                    }
                };
                chartConfig.series = [{
					type: 'column',
                    showInLegend: false,
                    color: config.color,
                    pointWidth: 12,
                    data: data
                }];
                chartConfig.expandedSettings = {
                    "height": 250,
                    "width": 1200,
                    "marginTop": 50,
                    "marginLeft": 90,
                    "marginRight": 70,
                    "showInLegend": true,
                    "pointWidth": 50,
                    "legend": {
                        itemStyle: {
                            color: 'rgb(117, 117, 117)',
                            fontWeight: '300',
                            fontSize: '12px'
                        },
                        layout: 'Vertical',
                        align: 'right',
                        verticalAlign: 'top',
                        x: -50,
                        itemMarginBottom: 18
                    },
                    "xAxis": {
                        title: {
                            text: 'Date',
                            style: {
                                color: 'rgba(0, 0, 0, 0.87)',
                                fontWeight: "800",
                                letterSpacing: "1",
                            }
                        },
                        tickLength: 0,
                        categories: [],
                    },
                };

                return chartConfig;
            }
            
            
            

            /////////////////////////////////////////////////////live user chart////////////////////////////////////////////////////////////////


            vm.configureLiveUserChart = function(chartdata , isExpand) {
				 var consumerData = vm.getDataForChart(chartdata.consumerUC);
				 var enterpriseData = vm.getDataForChart(chartdata.enterpriseUC);
                 //~ for(var i = 0 ; i < consumerData.length ; i++ ){
					//~ consumerData[i] = $filter('hasValue')(consumerData[i]) ? parseInt(consumerData[i]) : 0 ; 
					//~ enterpriseData[i] = $filter('hasValue')(enterpriseData[i]) ? parseInt(enterpriseData[i]) : 0 ; 
				//~ }
				var config =  new NVDashboardService.LineChartConfig();
                // config = new DashboardService.AreasplineChartConfig();
                config = new NVDashboardService.LineChartConfig();
                config.yAxis[0].tickInterval = 100;
                config.options.chart.height = 200;
                config.options.chart.margin = [20, 28, 70, 60];
                 var categories = vm.getDayMonthAndDate();
			     config.xAxis[0].categories = categories.xAxisSeries;
				 config.xAxis[0].title.text = categories.type;
                config.credits =  { enabled: false  } ; 
                config.title ={ text:'' } ; 
                config.options.legend.itemDistance = 15;
                config.yAxis[0].title = {
                    text: 'Count',
                    style: {
                        color: 'rgba(0, 0, 0, 0.87)',
                        fontWeight: "800",
                        letterSpacing: "1",
                    },
                    gridLineColor: '#f7f7f7'
                };
                config.series = [{
                    showInLegend: true,
                    unit: ' Count',
                    name: 'Consumer',
                    type: 'spline',
                    color: "#5B788F",
                    data: consumerData
                }, {
                    showInLegend: true,
                    unit: ' Date',
                    name: 'Enterprise',
                    color: "#FBD568",
                    type: 'spline',
                    data: enterpriseData
                }];
                if(!isExpand){
					  vm.chartLiveUser = config ; 
				}else{
					 vm.chartConfigExpand  = config ;
				}
                vm.chartLiveUser.expandedSettings = {
                    "height": 250,
                    "marginTop": 50,
                    "marginLeft": 90,
                    "marginRight": 70,
                    "legend": {
                        itemStyle: {
                            color: 'rgb(117, 117, 117)',
                            fontWeight: '300',
                            fontSize: '12px'
                        },
                        layout: 'horizontal',
                        align: 'right',
                        verticalAlign: 'top',
                        x: -50,
                        itemMarginBottom: 18,

                        useHTML: true,
                        labelFormatter: function() {
                            return '<span>' + this.name + '</span>' + '</br>' + '<p  class = "custom-legend-font" >' + this.yData[this.yData.length - 1] + 'sec' + '</p>';
                        }
                    },
                    "xAxis": {
                        title: {
                            text: 'Date',
                            style: {
                                color: 'rgba(0, 0, 0, 0.87)',
                                fontWeight: "800",
                                letterSpacing: "1",
                            }
                        },
                        tickLength: 0,
                        categories: [ ],
                    },
                };

            }
            /////////////////////////////////////////////////////health index chart////////////////////////////////////////////////////////////////

            vm.configureHealthChart = function(data ,  isExpand) {
				var healthData = vm.getDataForChart(data.starRating)  ;
				
				var config ={};
				config = new NVDashboardService.AreasplineChartConfig();
                config.series[0].color = "#9FB2C1";
                config.series[0].data = healthData;
                config.options.chart.height = 140;
                config.options.chart.margin = [0, 30, 0, 160];
                config.series[0].type = 'areaspline' ;
                config.credits =  { enabled: false  } ; 
			    config.title ={ text:'' } ;
			    
			    var categories = vm.getDayMonthAndDate();
			    config.xAxis[0].categories = categories.xAxisSeries;
				config.xAxis[0].title.text = categories.type;
				var temp = [];
				for(var i = 0 ; i <= 10 ; i ++){
					temp.push(false);
				}
				temp[( parseFloat(healthData[6])*2)] = true ;
				vm.setNVData("starChecked" , temp ) ;
				
					
                config.options.legend = {
                    floating: false
                };
                if(!isExpand){
					 vm.chartHealthIndex = config ; 
				 }else{
					 vm.chartConfigExpand = config ;
			     }

                vm.chartHealthIndex.expandedSettings = {
                    "height": 250,
                    "marginTop": 50,
                    "marginLeft": 70,
                    "marginRight": 70,
                    "xAxis": {
                        title: {
                            text: 'Date',
                            style: {
                                color: 'rgba(0, 0, 0, 0.87)',
                                fontWeight: "800",
                                letterSpacing: "1",
                            }
                        },
                        tickLength: 0,
                        categories: [],
                    },
                };
            }

            /////////////////////////////////////////////////////packet loss chart////////////////////////////////////////////////////////////////	
            vm.configurePacketLossChart = function(data ,  isExpand) {
				var latency = vm.getDataForChart(data.latency)  ;
				var jitter = vm.getDataForChart(data.jitter)  ;
				var packet = vm.getDataForChart(data.packet)  ;
				 //~ for(var i = 0 ; i < latency.length ; i++ ){
					//~ latency[i] = $filter('hasValue')(latency[i]) ? parseInt(latency[i]) : 0 ; 
					//~ jitter[i] = $filter('hasValue')(jitter[i]) ? parseInt(jitter[i]) : 0 ; 
					//~ packet[i] = $filter('hasValue')(packet[i]) ? parseInt(packet[i]) : 0 ; 
				//~ }
				
                vm.latency = data.latency;
                vm.jitter = data.jitter;
                vm.packetLossHeader = data.packetLoss;
                var config = {};
                config = new NVDashboardService.ColumnChartConfig();
                vm.chartConfigPacketLoss = {};
               
			    config.options.chart.height = 400;
				config.options.chart.marginTop = 85;
				config.credits =  { enabled: false  } ; 
                config.title ={ text : '' } ; 
                
                config.series = [{
					 type: 'column',
                    showInLegend: true,
                    unit: ' ms',
                    name: 'Latency',
                   
                    color: "#9CC1DE",
                    data: latency
                }, {
					 type: 'column',
                    showInLegend: true,
                    unit: ' ms',
                    name: 'Jitter',
                    color: "#FBD568",
                   
                    data: jitter
                }, {
					 type: 'spline',
                    showInLegend: true,
                    color: "#5B788F",
                    unit: ' %',
                    yAxis: 1,
                    name: 'Packet Loss',
                   
                    data: packet
                }];
                config.yAxis.push({ // Secondary yAxis
                    title: {
                        text: 'Packet Loss',
                        style: {
                            color: 'rgba(0, 0, 0, 0.87)',
                            fontWeight: "800",
                            letterSpacing: "1",
                        }
                    },
                    labels: {
                        format: '{value} %'
                    },
                    opposite: true
                });
				config.yAxis[0].title = {
                    text: 'ms',
                    style: {
                        color: 'rgba(0, 0, 0, 0.87)',
                        fontWeight: "800",
                        letterSpacing: "1",
                    }
                };
                config.yAxis.gridLineColor = '#f7f7f7';
                config.yAxis[0].tickInterval = 50;
                config.options.legend.layout = 'horizontal';
                config.options.legend.y = -10;
                config.options.legend.x = 20;
                 var categories = vm.getDayMonthAndDate();
			     config.xAxis[0].categories = categories.xAxisSeries;
				 config.xAxis[0].title.text = categories.type;
                //vm.chartConfigPacketLoss.options.legend.itemMarginBottom = 150;
                if(!isExpand){
					 vm.chartConfigPacketLoss = config ;
				}else{
					 vm.chartConfigExpand = config ;
				}
                vm.chartConfigPacketLoss.expandedSettings = {
                    "height": 250,
                    "marginTop": 50,
                    "marginLeft": 70,
                    "marginRight": 70,
                    "legend": {
                        itemStyle: {
                            color: 'rgb(117, 117, 117)',
                            fontWeight: '300',
                            fontSize: '12px'
                        },
                        layout: 'horizontal',
                        align: 'right',
                        verticalAlign: 'top',
                        x: -50,
                        itemMarginBottom: 18,
                        symbolHeight: 8,
                        symbolWidth: 8,
                        symbolRadius: 8,
                    },
                    "xAxis": {
                        title: {
                            text: 'Date',
                            style: {
                                color: 'rgba(0, 0, 0, 0.87)',
                                fontWeight: "800",
                                letterSpacing: "1",
                            }
                        },
                        tickLength: 0,
                        categories: [ ],
                    },
                };

            };

            /////////////////////////////////////////////////////download time chart////////////////////////////////////////////////////////////////
            vm.configureGoogleChart = function(data ,  isexpand) {
                var google = vm.getDataForChart(data.url1BrowseTime);
                var facebook = vm.getDataForChart(data.url2BrowseTime);
                var youtube = vm.getDataForChart(data.url3BrowseTime);
                
				 for(var i = 0 ; i < google.length ; i++ ){
					google[i] = $filter('hasValue')(google[i]) ? parseInt(google[i]) : 0 ; 
					facebook[i] = $filter('hasValue')(facebook[i]) ? parseInt(facebook[i]) : 0 ; 
					youtube[i] = $filter('hasValue')(youtube[i]) ? parseInt(youtube[i]) : 0 ; 
				}
				
                var config = new NVDashboardService.ColumnChartConfig();
                var categories = vm.getDayMonthAndDate();
                
                vm.chartConfigDownloadTime = {};
                
                config.series = [{
					type:'column',
                    name: 'Google',
                    data: google,
                    color: '#99da88',
                    pointWidth: 12,
                    marker: {
                        symbol: 'circle',
                        radius: 10
                    }
                }, {
					type:'column',
                    name: 'Facebook',
                    data: facebook,
                    color: '#5c7a92',
                    pointWidth: 12,
                    marker: {
                        symbol: 'circle',
                        radius: 10
                    }
                }, {
					type:'column',
                    name: 'Youtube',
                    data: youtube,
                    color: '#f68a8a',
                    pointWidth: 12,
                    marker: {
                        symbol: 'circle',
                        radius: 10
                    }
                }];
                config.yAxis[0].title = {
                    text: 'Second',
                    style: {
                        color: 'rgba(0, 0, 0, 0.87)',
                        fontWeight: "800",
                        letterSpacing: "1",
                    }
                };
                config.options.chart.height = 200;
                config.yAxis[0].tickInterval = 5;
                
                config.options.plotOptions.series = {
                    marker: {
                        enabled: true
                    }
                };
                 config.credits =  { enabled: false  } ; 
			     config.title ={ text:'' } ; 
			     var categories = vm.getDayMonthAndDate();
			     config.xAxis[0].categories = categories.xAxisSeries;
				 config.xAxis[0].title.text = categories.type;
                if(!isExpand){
					vm.chartConfigDownloadTime = config ;
				}else{
					vm.chartConfigExpand = config ;
				}
                vm.chartConfigDownloadTime.expandedSettings = {
                    "height": 250,
                    "marginTop": 50,
                    "marginLeft": 90,
                    "marginRight": 70,
                    "legend": {
                        itemStyle: {
                            color: 'rgb(117, 117, 117)',
                            fontWeight: '300',
                            fontSize: '12px'
                        },
                        layout: 'horizontal',
                        align: 'right',
                        verticalAlign: 'top',
                        x: -50,
                        itemMarginBottom: 18,
                        symbolHeight: 8,
                        symbolWidth: 8,
                        symbolRadius: 8,
                    },
                    "xAxis": {
                        title: {
                            text: 'Date',
                            style: {
                                color: 'rgba(0, 0, 0, 0.87)',
                                fontWeight: "800",
                                letterSpacing: "1",
                            }
                        },
                        tickLength: 0,
                        categories: [],
                    },
                };
            };

            /////////////////////////////////////////////////////pie chart////////////////////////////////////////////////////////////////  

   

            ///////////////////////////////////////////////end-of-pie-chart//////////////////////////////////////////////
            vm.expandedView = function(ev, data) {
                var templateUrl = '../app/uiapp/dashboard/src/dashboardlist/nvDashboard/expanded-view/expanded-template.html';
                var controllerName = 'NVDashboardExpandViewCtrl';
                var title = "";
                switch (data) {
                    case "DOWNLOAD_SPEED":
                        title = "Download Speed";
                        break;
                    case "UPLOAD_SPEED":
                        title = "Upload Speed";
                        break;
                    case "SIGNAL_STRENGTH":
                        title = "Signal Strength";
                        break;
                    case "QUALITY":
                        title = "Quality";
                        break;
                    case "SINR":
                        title = "SINR";
                        break;
                    case "PACKET_LOSS":
                        title = "Packet Loss";
                        break;
                    case "HEALTH_INDEX":
                        title = "Health Index";
                        break;
                    case "DOWNLOAD_TIME":
                        title = "Donwload Time";
                        break;
                    case "TOP_LOCATION":
                        title = "Top Location";
                        templateUrl = '../app/uiapp/dashboard/src/dashboardlist/nvdashboard/expanded-view/canvas.expanded-template.html';
                        controllerName = 'CanvasElementExpandedViewCtrl';
                        break;
                    case "CALL_ANALYTICS":
                        title = "Call Analytics";
                        templateUrl = './app/uiapp/dashboard/src/dashboardlist/nvdashboard/expanded-view/canvas.expanded-template.html';
                        controllerName = 'CanvasElementExpandedViewCtrl';
                        break;
                }
                vm.expand = {};
                vm.expand.title = title;
                vm.expand.kpi = data;

                $mdDialog.show({
                    controllerAs: 'v',
                    templateUrl: templateUrl,
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    controller: NVDashboardExpandViewCtrl
                });

                function NVDashboardExpandViewCtrl($scope, $mdDialog, $interval, globalServiceCommon) {
                    var v = this;
                    var removeChangeListViewListener = null;

                    v.showFilterMenu = showFilterMenu;

                    function showFilterMenu() {
                        v.filtermenu = !v.filtermenu;
                    }
                    v.filterClose = filterClose;

                    function filterClose() {
                        v.filtermenu = !v.filtermenu;
                    }

                    function init() {
                        /***************Chart Start******************************/
                        v.expandedDownload = vm.getNVChartData(vm.expand.kpi , true);
                        /***************Chart End******************************/

                        /***************List of Devices Start******************************/
                        vm.getListOfDevices();
                        /***************List of Devices End******************************/

                        /***************Pie Chart Start******************************/
                        var config = {
                            'name': ['Android', 'iOS'],
                            'color': ['#6A8EE6', '#40BEF2']
                        }
                        vm.chartOperatingSystem = vm.configurePieChart(data.OperatingSystem, config, true);
                        /***************Pie Chart End******************************/
                    };

                    vm.getListOfDevices = function() {
                        var url2 = '../app/uiapp/dashboard/src/dashboardlist/nvdashboard/data/nv-dashbord-chart-2.json';
                        globalServiceCommon.sendGETRequest(url2).then(function(result) {

                            if ($filter('hasValue')(result) && $filter('hasValue')(result.data)) {
                                setListAndTable(result.data);
                            }
                        });
                    }

                    function setListAndTable(data) {
                        vm.tableData = data.Operator; //default Operator set
                        vm.chartEnable = false; //default Operator set
                        var changeHeader = {
                            "Operator": "Operator Name",
                            "Devices": "Device Make",
                            "Android": "Version",
                            "iOS": "Version",
                            "Operating System": "Operating System"
                        };
                        removeChangeListViewListener = $scope.$on('emit:changeListView', function(event, data) {
                            vm.tableData = data.item;
                            vm.titleHearder = changeHeader[data.key];
                            vm.chartEnable = data.key == 'Operating System' ? true : false;
                        });
                        vm.titleHearder = changeHeader['Operator']; //default Operator set
                    }

                    init();

                    /******************************************addToDownload-popup**************************************/
                    vm.addToDownload = addToDownload;

                    function addToDownload(params) {
                        $mdDialog.show({
                            parent: angular.element(document.body),
                            clickOutsideToClose: true,
                            templateUrl: '../app/uiapp/dashboard/src/dashboardlist/nvdashboard/expanded-view/addtodownload-popup.html',
                            scope: $scope,
                            preserveScope: true,
                        })
                    }

                    $scope.cancel = function() {
                        $mdDialog.cancel();
                    };
                    /******************************************addToDownload-popup**************************************/

                    /******************************************Close Window**************************************/
                    $scope.$on('$destroy', onDestroy);

                    function onDestroy() {
                        removeChangeListViewListener();
                        //$interval.cancel(vm.expandedDownload[0].removeIntervalLiveUserchart);
                    };
                }
            }

        

            /***call Analytics**/
            //~ vm.callAnalyticsMap = {};
            //~ var callAnalyticsMapid = "CallAnalytics";
            //~ leafletData.getMap(callAnalyticsMapid).then(function(currentMap) {
                //~ vm.callAnalyticsMap = currentMap;
                //~ vm.callAnalyticsMap.easelCanvas = new LayersMapsServiceLyrs.CanvasLayer(callAnalyticsMapid);
                //~ //vm.callAnalyticsMap.baseMapService = new BaseMapLayerServiceLyrs(callAnalyticsMapid);
                //~ var config = {
                    //~ 'popup': {
                        //~ className: 'leaflet-topology-popup',
                        //~ maxWidth: 10,
                        //~ minWidth: 10,
                        //~ offset: L.point(0, -20),
                        //~ closeButton: false
                    //~ }
                //~ };
                //~ vm.callAnalyticsMap.CallAnalyticLayers = new NVDashboardService.CallAnalyticLayers(callAnalyticsMapid);
                //~ vm.callAnalyticsMap.CallAnalyticLayers.addLayer({}, config);
                //~ vm.callAnalyticsMap._handlers.forEach(function(handler) {
                    //~ handler.disable();
                //~ });
            //~ });

            /** md-sidenav **/
            vm.showMenu = showMenu;

            function showMenu() {
                vm.MenuOpen = !vm.MenuOpen;
                if (vm.MenuOpen) {
                    $mdSidenav('right').open();
                } else {
                    $mdSidenav('right').close();
                }
            };
            vm.MenuOpen = false;

            /** md-sidenav Applied Filter */
            vm.enableFilter = true
            vm.enableAppliedFilter = false;
            vm.showAppliedfilter = showAppliedfilter;

            function showAppliedfilter() {
                vm.enableAppliedFilter = true;
                vm.enableFilter = false;
            };
            vm.backtoFilter = backtoFilter;

            function backtoFilter() {
                vm.nvData.enableFilter = true
                vm.enableAppliedFilter = false;
            };

         
            /**close Window***/
            $scope.$on('$destroy', onDestroy);

            function onDestroy() {
                //$interval.cancel(vm.removeIntervalLiveUserchart);
            };
            vm.initNVDashboard();

	}

        })();
