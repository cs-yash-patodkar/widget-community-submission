/* Copyright start
  Copyright (C) 2008 - 2023 Fortinet Inc.
  All rights reserved.
  FORTINET CONFIDENTIAL & FORTINET PROPRIETARY SOURCE CODE
  Copyright end */
'use strict';
(function () {
  angular
    .module('cybersponse')
    .controller('communitySubmission100Ctrl', communitySubmission100Ctrl);

  communitySubmission100Ctrl.$inject = ['$scope', 'Upload', 'API', 'toaster', 'communitySubmissionService', 'markdownEditorService'];
  function communitySubmission100Ctrl($scope, Upload, API, toaster, communitySubmissionService, markdownEditorService) {

    $scope.category = [{ name: 'Connector', type: 'connector' }, { name: 'Solution Pack', type: 'solutionpack' }, { name: 'Widget', type: 'widget' }]
    $scope.user = {
      fullName: ''
    };
    $scope.user = {
      emailId: ''
    };
    $scope.user = {
      organizationName: ''
    };
    $scope.solutionDetails = '\nApi Identifier: \nVersion: \nFSR Version:    \nDocuments Included: Yes/No \nDescription:';
    $scope.user = {
      solutionTitle: ''
    };
    $scope.selectedCategory = {
      name: ''
    };
    $scope.selectedSolution = {
      selectedSolution: ''
    }
    $scope.selectedCategoryChanged = selectedCategoryChanged;
    // $scope.getMdInstance = getMdInstance;

    $scope.uploadFiles = uploadFiles;

    $scope.uploadedFileFlag = null;
    $scope.submit = submit;
    // var mdEditorInstance;
    // var template = 'Name:Api Indentifier:Version:FSR Version:Brief Description:Documents Included:Description'
    $scope.cancel = cancel;


    init();
    function init() {
      // getMdInstance();
      communitySubmissionService.getInstalledContent($scope).then(function (result) {
        $scope.createdContent = result;
      });
      // markdownEditorService.insertContent(mdEditorInstance, template);
    }

    // function getMdInstance(instance) {
    //   mdEditorInstance = instance;
    // }

    function selectedCategoryChanged(category){
      $scope.selectedCategory.name = category.name;
    }

    function uploadFiles(file) {
      // Filter out folders from the selected files
      if (file.size < 25072682) {
        if (file.type) {
          file.upload = Upload.upload({
            url: API.BASE + 'files',
            data: {
              file: file
            }
          });
          $scope.loadingJob = true;
          file.upload.then(function (response) {
            $scope.fileIRI = response.data;
            $scope.loadingJob = false;
            $scope.uploadedFileFlag = true;
            if ($scope.showCreatedSolutions) {
              communitySubmissionService.triggerPlaybook($scope);
            }
          },
            function (response) {
              $scope.loadingJob = false;

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

    function cancel() {
      $scope.playbookTriggered = false;
      $scope.uploadedFile = null;
      $scope.user = {
        fullName: ''
      };
      $scope.user = {
        emailId: ''
      };
      $scope.user = {
        organizationName: ''
      };
      $scope.solutionDetails = '';
      $scope.user = {
        solutionTitle: ''
      };
      $scope.uploadedFileFlag = null;
      $scope.selectedSolution.selectedSolution = '';
      const customModal = document.getElementById('custom-modal');
      $scope.nextPage = false;
      customModal.setAttribute('style', 'display:none;');
    }

    function submit() {
      if ($scope.communitySubmissionForm.$invalid) {
        $scope.communitySubmissionForm.$setTouched();
        $scope.communitySubmissionForm.$focusOnFirstError();
        return;
      }
      if ($scope.showCreatedSolutions) {
        communitySubmissionService.exportSolution($scope.selectedSolution.selectedSolution, $scope);
      }
      else {
        communitySubmissionService.triggerPlaybook($scope);
      }
    }
  }
})();
