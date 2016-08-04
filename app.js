(function () {

    angular.module('cidades', [])
        .controller('CidadesController', function ($scope, $http, $filter) {
            $scope.serverScrapyd = 'http://localhost:6800/';
            var serverScrapydLocalDir = '/scrapyd/';
            var client = 'http://localhost/estagio/';
            $scope.fileResume = {ultimoEstado:[], itemsRaspados:[], totais:[]};

            listProjects();

            function listProjects() {
                $http.get($scope.serverScrapyd+'listprojects.json').success(function (dados) {
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
                    url: $scope.serverScrapyd+'listspiders.json',
                    method: "GET",
                    params: {project: project}
                }).success(function (dados) {
                    $scope.spiders = dados.spiders;
                });

                $scope._project = project;
            };

            $scope.listJobs = function (project) {

                $http({
                    url: $scope.serverScrapyd+'listjobs.json',
                    method: "GET",
                    params: {project: project}
                }).success(function (dados) {
                    // console.log(dados);
                    // $scope.jobsPending = dados.pending;
                    $scope.jobsRunning = dados.running;
                    // $scope.jobsFinished = dados.finished;
                });

            };

            $scope.schedule = function (spider) {
                $http({
                    url: $scope.serverScrapyd+'schedule.json',
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
                    'FEED_URI='+serverScrapydLocalDir + 'jobs/items/' +$scope._project +"/"+ spider + '/' + $filter('date')(new Date(), 'yyyy-MM-dd_HH.mm.ss') + '.csv',
                    'LOG_FILE='+serverScrapydLocalDir + 'jobs/logs/' +$scope._project +"/"+ spider + '/' + $filter('date')(new Date(), 'yyyy-MM-dd_HH.mm.ss') + '.log',
                    'JOBDIR='+serverScrapydLocalDir + 'state/' + $scope._project +"/"+ spider
                ];

                $http({
                    url: $scope.serverScrapyd+'schedule.json',
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
                    url: $scope.serverScrapyd+'cancel.json',
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

            $scope.listFiles = function (spider) {
                var file = $scope.serverScrapyd + "items/" + $scope._project + "/" + spider;

                $http({
                    url: client + 'getFile.php',
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

            $scope.showFileResume = function (index, file) {
                $http.get(client + 'getFile.php?file='+$scope.serverScrapyd + "logs/" + $scope._project + "/" + $scope._spider + "/" + file + ".log")
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

            $scope.clearAll = function () {
                // var dir = '/home/osboxes/Documents/scrapyd/items';
                var dir = serverScrapydLocalDir + '/jobs';

                    $http.get(client + 'delDir.php?dir='+dir)
                    .success(function (dados) {
                        alert(dados);
                    });
            }

        });

})();
