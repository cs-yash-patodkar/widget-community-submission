'use strict';

(function () {
    angular
        .module('cybersponse')
        .factory('communitySubmissionService', communitySubmissionService);

    communitySubmissionService.$inject = ['Upload', 'API', 'toaster', 'playbookService', '$timeout', '$http', '$q', 'ALL_RECORDS_SIZE', 'MARKETPLACE', 'connectorService', 'marketplaceService', 'Modules', '$interval'];

    function communitySubmissionService(Upload, API, toaster, playbookService, $timeout, $http, $q, ALL_RECORDS_SIZE, MARKETPLACE, connectorService, marketplaceService, Modules, $interval) {

        var service = {
            exportSolution: exportSolution,
            getInstalledContent: getInstalledContent,
            triggerPlaybook: triggerPlaybook
        }
        return service;

        function uploadFiles(file, scope) {
            // Filter out folders from the selected files
            if (file.size < 25072682) {
                if (file.type) {
                    file.upload = Upload.upload({
                        url: API.BASE + 'files',
                        data: {
                            file: file
                        }
                    });
                    scope.loadingJob = true;
                    file.upload.then(function (response) {
                        scope.fileIRI = response.data;
                        scope.loadingJob = false;
                        scope.uploadedFileFlag = true;
                        if (scope.showCreatedSolutions) {
                            triggerPlaybook(scope);
                        }
                    },
                        function (response) {
                            scope.loadingJob = false;

                            if (response.status > 0) {
                                $log.debug(response.status + ': ' + response.data);
                            }
                            var message = 'Upload failed. Please try again.';
                            if (response.status === 413) {
                                message = 'File exceeds the maximum size.';
                            }
                            toaster.error({ body: message });
                        });
                }
            }
            else {
                toaster.error({ body: 'File size exceeded limit, please try again' });
            }
        }

        function returnParameters() {
            return {
                'input': {},
                'request': {
                    'data': {
                        'records': [],
                    }
                },
                'useMockOutput': false,
                'globalMock': false,
                'force_debug': true
            };
        }

        function deleteScope(scope) {
            scope.playbookTriggered = false;
            scope.uploadedFile = null;
            scope.selectedSolution = { selectedSolution: '' };
            scope.user = {
                fullName: ''
            };
            scope.user = {
                emailId: ''
            };
            scope.user = {
                organizationName: ''
            };
            scope.solutionDetails = '\nName: \nApi Indentifier: \nVersion: \nFSR Version:    \nBrief Description: \nDocuments Included: \nDescription:';
            scope.user = {
                solutionTitle: ''
            };
            scope.selectedCategory = '';
            scope.uploadedFileFlag = null;
        }

        function triggerPlaybook(scope) {
            var queryPayload = returnParameters();
            if (scope.fileIRI && scope.fileIRI['@id']) {
                queryPayload.request.data['fileIRI'] = scope.fileIRI['@id'];
            }
            queryPayload.request.data['userName'] = scope.user.fullName;
            queryPayload.request.data['category'] = scope.selectedCategory.name;
            queryPayload.request.data['userEmailID'] = scope.user.emailId;
            queryPayload.request.data['organizationName'] = scope.user.organizationName;
            queryPayload.request.data['solutionTitle'] = scope.user.solutionTitle;
            queryPayload.request.data['solutionDetails'] = scope.solutionDetails;
            var queryUrl = '/api/triggers/1/notrigger/beb68f0b-2aed-4e24-ae25-c5e24d40fb03?force_debug=true';
            $http.post(queryUrl, queryPayload).then(function (result) {
                scope.playbookTriggered = true;
                if (result && result.data && result.data.task_id) {
                    playbookService.checkPlaybookExecutionCompletion([result.data.task_id], function (response) {
                        if (response && (response.status === 'finished' || response.status === 'failed')) {
                            playbookService.getExecutedPlaybookLogData(response.instance_ids).then(function (res) {
                                if (res.result.status === 'Success') {
                                    scope.playbookTriggered = false;
                                    scope.nextPage = true;
                                    defer.resolve({
                                        result: res.result,
                                        status: response.status
                                    });
                                }
                                else {
                                    toaster.error({ body: 'Playbook failed please try again' });
                                    scope.nextPage = false;
                                    defer.reject('Playbook failed');
                                }
                            }, function (err) {
                                toaster.error({ body: 'Playbook failed please try again' });
                                defer.reject(err);
                                scope.playbookError = true;
                            });
                        }
                    }, function (error) {
                        toaster.error({ body: 'Playbook failed please try again' });
                        defer.reject(error);
                        scope.playbookError = true;
                    }, scope);
                }
            }, function (err) {
                defer.reject(err);
            });
        }

        function getInstalledContent(scope) {
            var defer = $q.defer();
            var queryObject = queryToGetInstalledContent();

            let appendQueryString = 'solutionpacks?$limit=' + ALL_RECORDS_SIZE;

            $http.post(API.QUERY + appendQueryString, queryObject).then(function (response) {
                defer.resolve(response.data['hydra:member']);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        }

        function queryToGetInstalledContent() {
            return {
                "sort": [
                    {
                        "field": "label",
                        "direction": "ASC"
                    }
                ],
                "page": 1,
                "limit": 30,
                "logic": "AND",
                "filters": [
                    {
                        "field": "type",
                        "operator": "in",
                        "value": ["connector", "widget", "solutionpack"]
                    },
                    {
                        "field": "local",
                        "operator": "eq",
                        "value": true
                    },
                    {
                        "field": "installed",
                        "operator": "eq",
                        "value": true
                    }
                ]
            }
        }

        function exportSolution(contentDetail, scope) {
            scope.user.solutionTitle = contentDetail.label;
            if (contentDetail.type === MARKETPLACE.CONTENT_TYPE.CONNECTOR) {
                _exportConnector(contentDetail.recordId, scope);
            } else if (contentDetail.type === MARKETPLACE.CONTENT_TYPE.WIDGET) {
                _exportWidget(contentDetail, scope);
            } else if (contentDetail.type === MARKETPLACE.CONTENT_TYPE.SOLUTION_PACK) {
                marketplaceService.exportContent(contentDetail).then(function (response) {
                    _openExportWizard(response.jobUuid, true).then(function(file){
                        scope.fileIRI = file['@id'];
                        triggerPlaybook(scope);
                    });
                }, function () {
                    toaster.error({
                        body: 'You do not have the necessary permissions to export the solution pack. Please contact your administrator for assistance.'
                    });
                });
            }
        }

        function _openExportWizard(jobUuid) {
            let optionIntervalCount = 0;
            let OPTIONS_TIMEOUT_SECONDS = 150;
            var deferred = $q.defer();
            let exportInterval = $interval(function () {
                Modules.get({
                    module: 'export_jobs',
                    id: jobUuid,
                    __selectFields: 'errorMessage,status,file'
                }).$promise.then(function (exportJob) {
                    if (optionIntervalCount > OPTIONS_TIMEOUT_SECONDS) {
                        toaster.error({ body: 'Export did not complete after ' + OPTIONS_TIMEOUT_SECONDS * 2 / 60 + ' minutes.' });
                    } else if (exportJob.status === 'Error') {
                        toaster.error({ body: exportJob.errorMessage });
                    } else if (exportJob.status !== 'Export Complete') {
                        optionIntervalCount++;
                        return;
                    }
                    $interval.cancel(exportInterval);
                    deferred.resolve(exportJob);
                });
            }, 2000);
            return deferred.promise;
        }

        function _exportWidget(widgetConfig, scope) {
            var data = {
                development: widgetConfig.development
            };
            var req = {
                method: 'POST',
                url: API.BASE + 'widgets/export/' + widgetConfig.recordId,
                responseType: 'arraybuffer',
                headers: {
                    'Accept': 'application/octet-stream'
                },
                data: data
            };
            $http(req).then(function (response) {
                var blob = new Blob([response.data], {
                    type: 'application/gzip'
                });
                var file = new File([blob], scope.selectedSolution.selectedSolution.name + '-' + scope.selectedSolution.selectedSolution.version + '.tgz', { type: 'application/x-gzip' });
                uploadFiles(file, scope);
            }, function () {
                toaster.error({
                    body: 'You do not have the necessary permissions to export the widget. Please contact your administrator for assistance.'
                });
            });
        }

        function _exportConnector(connectorInfo, scope) {
            connectorService.exportDevelopedConnector(connectorInfo).then(function (response) {
                let blob = new Blob([response.data], {
                    type: 'application/gzip'
                });
                var file = new File([blob], scope.selectedSolution.selectedSolution.name + '.tgz', { type: 'application/x-gzip' });

                uploadFiles(file, scope);
            }, function (error) {
                console.log(error)
                toaster.error({
                    body: 'You do not have the necessary permissions to export the connector. Please contact your administrator for assistance.'
                });
            });
        }
    }
})();
