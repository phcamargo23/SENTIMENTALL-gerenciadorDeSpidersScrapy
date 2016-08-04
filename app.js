(function () {

    angular.module('cidades', [])
        .controller('CidadesController', function ($scope, $http) {
            $scope._scrapydUrl = 'http://localhost:6800/';
            var scrapydUiUrl = 'http://localhost/estagio/';
            $scope.fileResume = {ultimoEstado:[], itemsRaspados:[], totais:[]};

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
                // $scope.fileResume.totais['itemsRaspados'] = 0;
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
                    // console.log(dados);
                    // $scope.jobsPending = dados.pending;
                    $scope.jobsRunning = dados.running;
                    // $scope.jobsFinished = dados.finished;
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
                        var re = /(a href\=\")([^\?\"]*)(\")/gmi;
                        var str = response.data;
                        var match;
                        var result = [];

                        while ((match = re.exec(str)) !== null) {
                            result.push(match[2]);
                        }

                        $scope.files = result;
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
                var parameters = {};
                parameters.project = $scope._project
                parameters.spider = spider;
                parameters.setting = [
                    'FEED_FORMAT=csv',
                    // 'FEED_URI=/scrapyd/items/'+$scope._project +"/"+ spider + '/'+'teste.csv',
                    // 'LOG_FILE=/scrapyd/logs/'+$scope._project +"/"+ spider + '/'+'teste.log',
                    'JOBDIR=/scrapyd/state/'+$scope._project +"/"+ spider
                ];

                $http({
                    url: $scope._scrapydUrl+'schedule.json',
                    method: "POST",
                    params: parameters
                    // setting: 'JOBDIR=/home/osboxes/Documents/scrapyd/state/'+$scope._project +"/"+ spider
                }).then(function (response) {
                    if (response.data.status === "ok") {
                        //console.log(response);
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

            // function showFile(file) {
            //     file = $scope._scrapydUrl + "items/" + $scope._project + "/" + $scope._spider + "/" + file;
            //
            //     $http({
            //         url: scrapydUiUrl + 'getFile.php',
            //         method: "POST",
            //         params: {
            //             'file': file
            //         },
            //         dataType: 'text'
            //     }).then(function (response) {
            //         if (response.status == "200") {
            //             //console.log(JSON.stringify(data));
            //             //console.log(JSON.parse(response.data));
            //             //$scope.files = JSON.parse(response.data);
            //             $scope.files = response.data;
            //         }
            //         else {
            //             alert("Error while scheduling job : " + response.data.message );
            //             //console.log(response);
            //         }
            //     });
            //
            // }


            $scope.showFileResume = function (index, file) {
                $http.get(scrapydUiUrl + 'getFile.php?file='+$scope._scrapydUrl + "logs/" + $scope._project + "/" + $scope._spider + "/" + file + ".log")
                    .success(function (dados) {

                        (function(){
                            var re = /'(finish_reason)': '(.*)',/;
                            var str = dados;
                            var match = re.exec(str);
                            $scope.fileResume.ultimoEstado[index] = match[2];
                        })();

                        (function(){
                            var re = /'(item_scraped_count)': (\d*),/;
                            var str = dados;
                            var match = re.exec(str);
                            $scope.fileResume.itemsRaspados[index] = (match[2] == null)?0:match[2];
                            // if ($scope.fileResume.totais['itemsRaspados'] == undefined) $scope.fileResume.totais['itemsRaspados'] = 0;
                            // $scope.fileResume.totais['itemsRaspados'] += parseInt($scope.fileResume.itemsRaspados[index]);
                        })();
                });
            }

        });

})();
