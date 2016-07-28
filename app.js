(function(){

angular.module('cidades', [])
.controller('CidadesController', function($scope, $http) {
	var scrapyd_url = 'http://localhost:6800/';
	var scrapyd_php_url = 'http://localhost/app-cidades-http/';


	$http.get('http://localhost:6800/listprojects.json').success(function(dados){
        $scope.projects = dados.projects;
    });

	$scope.selectProject = function(project) {
		$http({
			url: 'http://localhost:6800/listspiders.json',
			method: "GET",
			params: {project: project}
		 }).success(function(dados){
			 //console.log(dados);
			$scope.spiders = dados.spiders;
			//alert("Error : "+JSON.stringify(dados));
		});

		$http({
			url: 'http://localhost:6800/listjobs.json',
			method: "GET",
			params: {project: project}
		 }).success(function(dados){
			$scope.jobsPending = dados.pending;
			$scope.jobsRunning = dados.running;
			$scope.jobsFinished = dados.finished;
			//$scope._project = project;
		});

		$scope._project = project;

	};

	$scope.selectSpider = function(spider){
		$scope._spider = spider;

		get_file(scrapyd_url+"items/"+$scope._project+"/"+$scope._spider);
		//get_file('http://localhost:6800/items/tutorial/lab/');
	}


		function get_file(file){
			$http({
				url: scrapyd_php_url+'teste.php',
				method: "POST",
				params: {
						'file':file
				},
				dataType: 'text'
			 }).then(function(response){
				if(response.status == "200")
				{
					//console.log(JSON.stringify(data));
					//console.log(JSON.parse(response.data));
					//$scope.files = JSON.parse(response.data);
					$scope.files = response.data;
				}
				else
				{
						//alert("Error while scheduling job : " + response.data.message );
						console.log(response);
				}
			});

		}

		function showFile(file){
			file = scrapyd_url+"items/"+$scope._project+"/"+$scope._spider+"/"+file;

			$http({
				url: scrapyd_php_url+'teste.php',
				method: "POST",
				params: {
						'file':file
				},
				dataType: 'text'
			 }).then(function(response){
				if(response.status == "200")
				{
					//console.log(JSON.stringify(data));
					//console.log(JSON.parse(response.data));
					//$scope.files = JSON.parse(response.data);
					$scope.files = response.data;
				}
				else
				{
						//alert("Error while scheduling job : " + response.data.message );
						console.log(response);
				}
			});

		}

	$scope.schedule = function(spider) {
		$http({
			url: 'http://localhost:6800/schedule.json',
			method: "POST",
			//params: {project: $scope._project, spider : spider}
			params: {project: $scope._project, spider : spider, setting : 'JOBDIR=C:/scrapyd/state'}
		 }).then(function(response){
			if(response.data.status === "ok")
			{
				$scope.listSpidersAndJobs($scope._project);

			}
			else
			{
				//alert("Error while scheduling job : " + JSON.stringify(dados) );
				alert("Error while scheduling job : " + response.data.message );
			}
		});
	};

	$scope.scheduleJob = function(spider, jobid) {
		$http({
			url: 'http://localhost:6800/schedule.json',
			method: "POST",
			params: { project:$scope._project, spider:spider, jobid:jobid }
		 }).then(function(response){
			if(response.data.status === "ok")
			{
				$scope._spider = spider;
				$scope.listSpidersAndJobs($scope._project);

			}
			else
			{
				//alert("Error while scheduling job : " + JSON.stringify(dados) );
				alert("Error while scheduling job : " + response.data.message );
			}
		});
	};

});

})();
