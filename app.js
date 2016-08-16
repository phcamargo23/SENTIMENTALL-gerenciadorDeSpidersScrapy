(function () {

    angular.module('estagio', [])
        .controller('MainController', function ($scope, $http, $filter, $interval, $timeout) {
            $scope.serverScrapyd = 'http://localhost:6800/';
            var serverScrapydJobsDir = '/scrapyd/jobs/';
            var client = 'http://localhost/estagio/';


            // http://tutorials.jenkov.com/angularjs/timeout-interval.html

            $scope.fileResume = {ultimoEstado: [], itemsRaspados: []};
            $scope.jobs = [];

            listProjects();

            function listProjects() {
                $http.get($scope.serverScrapyd + 'listprojects.json').success(function (dados) {
                    $scope.projects = dados.projects;
                });
            }

            function autoConsultJob(project, spider, jobLog) {
                var log = client + 'getFile.php?file=' + $scope.serverScrapyd + jobLog;
                $http.get(log)
                    .success(function (dados) {
                        // console.log(log);
                        // $scope.teste = dados;
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
                    url: $scope.serverScrapyd + 'listspiders.json',
                    method: "GET",
                    params: {project: project}
                }).success(function (dados) {
                    $scope.spiders = dados.spiders;
                });

                $scope._project = project;
            };

            $scope.listJobs = function (project) {
                $http({
                    url: $scope.serverScrapyd + 'listjobs.json',
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
                var date = $filter('date')(new Date(), 'yyyy-MM-dd_HH.mm.ss');
                var item = 'items/' + $scope._project + "/" + spider + '/' + date + '.csv';
                var log = 'logs/' + $scope._project + "/" + spider + '/' + date + '.log';
                var parameters = {};
                parameters.project = $scope._project
                parameters.spider = spider;
                parameters.setting = [
                    'FEED_FORMAT=csv',
                    'FEED_URI=' + serverScrapydJobsDir + item,
                    'LOG_FILE=' + serverScrapydJobsDir + log
                ];

                $http({
                    url: $scope.serverScrapyd + 'schedule.json',
                    method: "POST",
                    params: parameters
                }).then(function (response) {
                    if (response.data.status === "ok") {
                        $timeout(function () {
                            // showJobStatsInRealTime(log);
                            var job = {id:response.data.jobid, job:date, project:$scope._project, spider:spider, resume:'[executando]'};
                            $scope.jobs.push(job);
                            $scope.monitorJob(job);
                            // $scope.listFiles(spider);
                        }, 3000);
                    }
                    else {
                        alert("Error while scheduling job : " + response.data.message);
                    }
                });
            };

            $scope.scheduleWithState = function (spider) {
                var date = $filter('date')(new Date(), 'yyyy-MM-dd_HH.mm.ss');
                var item = 'items/' + $scope._project + "/" + spider + '/' + date + '.csv';
                var log = 'logs/' + $scope._project + "/" + spider + '/' + date + '.log';
                var parameters = {};
                parameters.project = $scope._project
                parameters.spider = spider;
                parameters.setting = [
                    'FEED_FORMAT=csv',
                    'FEED_URI=' + serverScrapydJobsDir + item,
                    'LOG_FILE=' + serverScrapydJobsDir + log,
                    'JOBDIR=' + serverScrapydJobsDir + 'state/' + $scope._project + "/" + spider
                ];

                $http({
                    url: $scope.serverScrapyd + 'schedule.json',
                    method: "POST",
                    params: parameters
                }).then(function (response) {
                    if (response.data.status === "ok") {
                        $timeout(function () {
                            var job = {id:response.data.jobid, job:date, project:$scope._project, spider:spider, resume:'[executando]'};
                            $scope.jobs.push(job);
                            $scope.monitorJob(job);
                        }, 3000);
                    }
                    else {
                        alert("Error while scheduling job : " + response.data.message);
                    }
                });
            };

            $scope.cancel = function (project, job) {
                $http({
                    url: $scope.serverScrapyd + 'cancel.json',
                    method: "POST",
                    params: {project: project, job: job}
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
                // var dir = '/home/osboxes/Documents/scrapyd/items';
                $scope.fileResume = {ultimoEstado: [], itemsRaspados: []};
                var dir = serverScrapydJobsDir;

                $http.get(client + 'listFiles.php?dir=' + dir + 'items/' + $scope._project + '/' + spider)
                    .success(function (dados) {
                        $scope.files = dados;
                    });
            }

            $scope.listFiles2 = function (spider) {
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
                        alert("Error while scheduling job : " + response.data.message);
                        //console.log(response);
                    }
                });
            }

            $scope.clearState = function (project, spider) {
                var dir = serverScrapydJobsDir + '/state';

                $http.get(client + 'delDir.php?dir=' + dir)
                    .success(function (dados) {
                        alert(dados);
                    });
            }

            $scope.clearAll = function () {
                // var dir = '/home/osboxes/Documents/scrapyd/items';
                var dir = serverScrapydJobsDir;

                $http.get(client + 'delDir.php?dir=' + dir)
                    .success(function (dados) {
                        alert(dados);
                    });
            }

            $scope.get_file = function (file) {
                console.log(file);
                $('#spider_file').html(file);
                launchSpinner("centerSpin", null, null);
                $.ajax({
                    type: "POST",
                    dataType: 'text',
                    url: client + 'getFile.php',
                    data: {
                        'file': file
                    },
                    crossDomain: true,
                })
                    .done(function (data) {
                        $('#spider_content').css('display', 'block');
                        $('#spider_content').html('<pre class="brush: bash">' + data + '</pre>');
                        SyntaxHighlighter.highlight();
                        stopSpinner("centerSpin", null);
                    })
                    .fail(function (xhr, textStatus, errorThrown) {
                        $('#spider_content').css('display', 'block');
                        $('#spider_content').html('<pre class="brush: bash">' + xhr.responseText + "<br>" + textStatus + '</pre>');
                        SyntaxHighlighter.highlight();
                        stopSpinner("centerSpin", null);
                    });
            }

            $scope.showFileResume = function (index, file) {
                var url = client + 'getFile.php?file=' + $scope.serverScrapyd + "logs/" + $scope._project + "/" + $scope._spider + "/" + file + "log";

                $http.get(url)
                    .success(function (dados) {
                        // alert(dados);
                        (function () {
                            var re = /'(finish_reason)': '(.*)',/;
                            var str = dados;
                            var match = re.exec(str);
                            $scope.fileResume.ultimoEstado[index] = match[2];
                        })();

                        (function () {
                            var re = /'(item_scraped_count)': (\d*),/;
                            var str = dados;
                            var match = re.exec(str);
                            // if ($scope.fileResume.totais['itemsRaspados'] == undefined) $scope.fileResume.totais['itemsRaspados'] = 0;
                            // $scope.fileResume.totais['itemsRaspados'] += parseInt($scope.fileResume.itemsRaspados[index]);
                            $scope.fileResume.itemsRaspados[index] = (match[2] == null) ? 0 : match[2];
                        })();
                        // console.log($scope.fileResume);
                    });
                /*
                 //CORS
                 $http.get($scope.serverScrapyd + "logs/" + $scope._project + "/" + $scope._spider + "/" + file + "log")
                 .success(function (dados) {
                 console.log(dados.projects);
                 });
                 */

            }


            // function showJobStatsInRealTime(file){
            $scope.monitorJob = function(job){
                // console.log(job);
                var count = 0;
                // $scope.fileResume.ultimoEstado[$scope.files.length] = '[running]';

                var timer = $interval(function () {
                    $http.get(client + 'getFile.php?file=' + $scope.serverScrapyd + 'logs/' + job.project + '/' + job.spider +'/'+ job.job + '.log')
                        .success(function (dados) {

                            (function () {
                                var re = /Scraped from/igm;
                                var str = dados;
                                var match = str.match(re);

                                if(match != null){
                                    count = str.match(re).length;
                                    // $scope.fileResume.itemsRaspados[$scope.files.length-1] = count;
                                    job.resume = count;
                                    // console.log(count);
                                }
                            })();

                            (function () {
                                var re = /Closing spider/igm;
                                var str = dados;
                                var match = re.exec(str);

                                if (match != null && angular.isDefined(timer)) {
                                    $interval.cancel(timer);
                                    // $scope.showFileResume($scope.files.length-1, file);
                                    // $scope.fileResume.ultimoEstado[$scope.files.length-1] = 'finished';
                                    $scope.listFiles(job.spider);
                                }
                            })();
                        });
                }, 500);
            }

        });
})();