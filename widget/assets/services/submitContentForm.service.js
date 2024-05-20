/* Copyright start
MIT License
Copyright (c) 2024 Fortinet Inc
Copyright end */
'use strict';
(function () {
    angular
        .module('cybersponse')
        .factory('submitContentFormService', submitContentFormService);

    submitContentFormService.$inject = ['Upload', 'API', 'toaster', 'playbookService', '$timeout', '$http', '$q', 'ALL_RECORDS_SIZE', 'MARKETPLACE', 'connectorService', 'marketplaceService', 'Modules', '$interval', '$resource'];

    function submitContentFormService(Upload, API, toaster, playbookService, $timeout, $http, $q, ALL_RECORDS_SIZE, MARKETPLACE, connectorService, marketplaceService, Modules, $interval, $resource) {

        var service = {
            exportSolution: exportSolution,
            getInstalledContent: getInstalledContent,
            triggerPlaybook: triggerPlaybook,
            deleteFile: deleteFile
        }
        return service;

        function deleteFile(uuid) {
            var defer = $q.defer();
            $http.delete(API.BASE + 'files/' + uuid).then(function (response) {
                defer.resolve(response);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        }

        function uploadFiles(file, scope) {
            // Filter out folders from the selected files
            const  maxFileSize = 25072682;
            if (file.size < maxFileSize) {
                if (file.type) {
                    file.upload = Upload.upload({
                        url: API.BASE + 'files',
                        data: {
                            file: file
                        }
                    });
                    scope.loadingJob = true;
                    file.upload.then(function (response) {
                        scope.fileMetadata = response.data;
                        scope.loadingJob = false;
                        scope.uploadedFileFlag = true;
                        triggerPlaybook(scope);
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

        function getAllPlaybooks(queryObject) {
            var defer = $q.defer();
            var url = API.QUERY + API.WORKFLOWS;
            $resource(url).save(queryObject, function (response) {
                if (response['hydra:member'] && (response['hydra:member'][0])) {
                    defer.resolve(response['hydra:member'][0]['uuid']);
                }
                else {
                    defer.reject("Playbook Not Found");
                }
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        }

        function triggerPlaybook(scope) {
            scrollToBottom();
            var queryPayload = returnParameters();
            if (scope.fileMetadata && scope.fileMetadata['@id']) {
                queryPayload.request.data['fileIRI'] = scope.fileMetadata['@id'];
            }
            queryPayload.request.data['userName'] = scope.user.fullName;
            queryPayload.request.data['category'] = scope.selectedCategory.name;
            queryPayload.request.data['userEmailID'] = scope.user.emailId;
            queryPayload.request.data['organizationName'] = scope.user.organizationName;
            queryPayload.request.data['solutionTitle'] = scope.user.solutionTitle;
            queryPayload.request.data['solutionDetails'] = scope.solutionDetails;
            var defer = $q.defer();
            var queryObjectPlaybook = {
                'sort': [
                    {
                        'field': 'createDate',
                        'direction': 'DESC',
                        '_fieldName': 'createDate'
                    }
                ],
                'limit': 1,
                'logic': 'AND',
                'filters': [
                    {
                        'field': 'recordTags',
                        'value': ['community-submission-send-mail'],
                        'display': '',
                        'operator': 'in',
                        'type': 'array'
                    },
                    {
                        'field': 'isActive',
                        'value': true,
                        'operator': 'eq'
                    }
                ],
                '__selectFields': [
                    'id',
                    'name'
                ]
            };

            // add a tag to the playbook, get the playbook instead of hardcoding the playbook iri
            getAllPlaybooks(queryObjectPlaybook).then(function (playbookUUID) {
                var queryUrl = API.MANUAL_TRIGGER + playbookUUID + '?force_debug=true';
                $http.post(queryUrl, queryPayload).then(function (result) {
                    scope.submitFormFlag = true;
                    if (result && result.data && result.data.task_id) {
                        playbookService.checkPlaybookExecutionCompletion([result.data.task_id], function (response) {
                            if (response && (response.status === 'finished' || response.status === 'failed')) {
                                playbookService.getExecutedPlaybookLogData(response.instance_ids).then(function (res) {
                                    if (res.result.status === 'Success') {
                                        if (scope.fileMetadata && scope.fileMetadata['id']) {
                                            deleteFile(scope.fileMetadata['id']);
                                        }
                                        scope.submitFormFlag = false;
                                        scope.currentStep = 3;
                                        defer.resolve({
                                            result: res.result,
                                            status: response.status
                                        });
                                    }
                                    else {
                                        toaster.error({ body: 'Playbook failed please try again' });
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
                    toaster.error({ body: 'Playbook error' });
                    defer.reject(err);
                });
            }, function (err) {
                toaster.error({ body: 'Playbook error' });

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

        function scrollToBottom() {
            var container = document.getElementById('community-details-form');
            container.scrollTop = container.scrollHeight;
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
            scrollToBottom();
            scope.user.solutionTitle = contentDetail.label;
            if (contentDetail.type === MARKETPLACE.CONTENT_TYPE.CONNECTOR) {
                _exportConnector(contentDetail.recordId, scope);
            } else if (contentDetail.type === MARKETPLACE.CONTENT_TYPE.WIDGET) {
                _exportWidget(contentDetail, scope);
            } else if (contentDetail.type === MARKETPLACE.CONTENT_TYPE.SOLUTION_PACK) {
                marketplaceService.exportContent(contentDetail).then(function (response) {
                    _openExportWizard(response.jobUuid, true).then(function (file) {
                        scope.fileMetadata = file['@id'];
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