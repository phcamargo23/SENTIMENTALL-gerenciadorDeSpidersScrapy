(function () {

    angular.module('cidades', [])
        .controller('CidadesController', function ($scope, $http) {
            $scope._scrapydUrl = 'http://192.168.2.38:6800/';
            var scrapydUiUrl = 'http://localhost/estagio/';

            listProjects();

            function listProjects() {
                $http.get($scope._scrapydUrl+'listprojects.json').success(function (dados) {
                    $scope.projects = dados.projects;
                });
            }

            $scope.listSpidersAndJobs = function (project) {
                $scope.listSpiders(project);
                $scope.listJobs(project);
            }

            $scope.listFilesAndJobs = function (spider) {
                $scope.listFiles(spider);
                $scope.listJobs($scope._project);

                $scope._spider = spider;
            }

            $scope.listSpiders = function (project) {
                $http({
                    url: $scope._scrapydUrl+'listspiders.json',
                    method: "GET",
                    params: {project: project}
                }).success(function (dados) {
                    $scope.spiders = dados.spiders;
                });

                $scope._project = project;
            };

            $scope.listJobs = function (project) {

                $http({
                    url: $scope._scrapydUrl+'listjobs.json',
                    method: "GET",
                    params: {project: project}
                }).success(function (dados) {
                    console.log(dados);
                    $scope.jobsPending = dados.pending;
                    $scope.jobsRunning = dados.running;
                    $scope.jobsFinished = dados.finished;
                });

            };

            $scope.listFiles = function (spider) {
                var file = $scope._scrapydUrl + "items/" + $scope._project + "/" + spider;

                $http({
                    url: scrapydUiUrl + 'getFile.php',
                    dataType: 'text',
                    method: "POST",
                    params: {
                        'file': file
                    }
                }).then(function (response) {
                    if (response.status == "200") {
                        //console.log(response.data);
                        $scope.files = response.data;
                    }
                    else {
                        alert("Error while scheduling job : " + response.data.message );
                        //console.log(response);
                    }
                });
            }

            $scope.schedule = function (spider) {
                $http({
                    url: $scope._scrapydUrl+'schedule.json',
                    method: "POST",
                    params: {project: $scope._project, spider: spider }
                }).then(function (response) {
                    if (response.data.status === "ok") {
                        $scope.listFilesAndJobs(spider);
                    }
                    else {
                        console.log(response);
                        alert("Error while scheduling job : " + response.data.message);
                    }
                });
            };

            $scope.scheduleWithState = function (spider) {
                $http({
                    url: $scope._scrapydUrl+'schedule.json',
                    method: "POST",
                    params: {project: $scope._project, spider: spider, setting: 'JOBDIR=/home/osboxes/Documents/scrapyd/state'}
                }).then(function (response) {
                    if (response.data.status === "ok") {
                        $scope.listFilesAndJobs(spider);
                    }
                    else {
                        //alert("Error while scheduling job : " + JSON.stringify(dados) );
                        alert("Error while scheduling job : " + response.data.message);
                    }
                });
            };

            $scope.cancel = function (project, job) {
                $http({
                    url: $scope._scrapydUrl+'cancel.json',
                    method: "POST",
                    params: { project: project, job: job }
                }).then(function (response) {
                    if (response.status == "200") {
                        alert("Job cancelado com sucesso!");
                        $scope.listFilesAndJobs($scope._spider);

                    }
                    else {
                        //alert("Error while scheduling job : " + JSON.stringify(dados) );
                        // console.log(response);
                        // console.log(project);
                        // console.log(job);
                        alert("Error while scheduling job : " + response.data.message);
                    }
                });
            };

            function showFile(file) {
                file = $scope._scrapydUrl + "items/" + $scope._project + "/" + $scope._spider + "/" + file;

                $http({
                    url: scrapydUiUrl + 'getFile.php',
                    method: "POST",
                    params: {
                        'file': file
                    },
                    dataType: 'text'
                }).then(function (response) {
                    if (response.status == "200") {
                        //console.log(JSON.stringify(data));
                        //console.log(JSON.parse(response.data));
                        //$scope.files = JSON.parse(response.data);
                        $scope.files = response.data;
                    }
                    else {
                        alert("Error while scheduling job : " + response.data.message );
                        //console.log(response);
                    }
                });

            }

        });

})();
