/* Copyright start
MIT License
Copyright (c) 2024 Fortinet Inc
Copyright end */
'use strict';
(function () {
  angular
    .module('cybersponse')
    .controller('submitContentForm100Ctrl', submitContentForm100Ctrl);

  submitContentForm100Ctrl.$inject = ['$scope', 'Upload', 'API', 'toaster', 'submitContentFormService', 'widgetUtilityService', '$rootScope', '$window'];
  function submitContentForm100Ctrl($scope, Upload, API, toaster, submitContentFormService, widgetUtilityService, $rootScope, $window) {

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
    $scope.solutionDetails = 'Description:  \nDocuments Included: Yes/No ';
    $scope.user = {
      solutionTitle: ''
    };
    $scope.selectedCategory = { name: '' };
    $scope.selectedSolution = {
      selectedSolution: ''
    }
    $scope.isLightTheme = $rootScope.theme.id === 'light';
    $scope.minimize = minimize;
    $scope.selectedCategoryChanged = selectedCategoryChanged;
    $scope.uploadFiles = uploadFiles;
    $scope.fileName = '';
    $scope.uploadedFileFlag = null;
    $scope.submit = submit;
    $scope.cancel = cancel;
    $scope.markdownConfig = {
      initialEditType: 'markdown', //wysiwyg/markdown
      previewStyle: 'tab',  //'vertical'
      height: '250px',
      usageStatistics: false,
      hideModeSwitch: true,
      toolbarItems: ['heading', 'bold', 'italic', 'strike', 'hr', 'divider', 'quote', 'ul', 'ol', 'indent',
        'outdent', 'divider', 'table', 'image', 'link', 'divider', 'code', 'codeblock'
      ]
    };
    $scope.moveToStep = moveToStep;
    $scope.openDocumentation = openDocumentation;

    $scope.showCreatedSolutions = 'created';
    $scope.currentStep = 1;
    const maxFileSize = 25072682;

    init();
    function init() {
      _handleTranslations();
      submitContentFormService.getInstalledContent($scope).then(function (result) {
        $scope.createdContent = result;
      });
    }

    function selectedCategoryChanged() {
      $scope.uploadedFileFlag = null;
      $scope.selectedSolution.selectedSolution = null;
      if ($scope.fileMetadata && $scope.fileMetadata.id) {
        submitContentFormService.deleteFile(angular.copy($scope.fileMetadata.id));
        $scope.fileMetadata = null;
      }
      $scope.fileName = null;
    }

    function _handleTranslations() {
      let widgetNameVersion = $scope.config.name + '-' + $scope.config.version;
      if (widgetNameVersion) {
        widgetUtilityService.checkTranslationMode(widgetNameVersion).then(function () {
          $scope.viewWidgetVars = {
            "AFTER_THE_PR_IS_RAISED": widgetUtilityService.translate('submitYourContent.AFTER_THE_PR_IS_RAISED'),
            "CLOSE": widgetUtilityService.translate('submitYourContent.CLOSE'),
            "COMPLETE_THESE_STEPS": widgetUtilityService.translate('submitYourContent.COMPLETE_THESE_STEPS'),
            "CONTENT_FORM": widgetUtilityService.translate('submitYourContent.CONTENT_FORM'),
            "CONTENT_SUBMITTED": widgetUtilityService.translate('submitYourContent.CONTENT_SUBMITTED'),
            "DETAILS_ABOUT_YOUR_SUBMISSION": widgetUtilityService.translate('submitYourContent.DETAILS_ABOUT_YOUR_SUBMISSION'),
            "DROP_A_TGZ_FILE": widgetUtilityService.translate('submitYourContent.DROP_A_TGZ_FILE'),
            "DROP_A_ZIP_FILE": widgetUtilityService.translate('submitYourContent.DROP_A_ZIP_FILE'),
            "EMAIL_ID": widgetUtilityService.translate('submitYourContent.EMAIL_ID'),
            "FILE_SIZE_EXCEEDED":widgetUtilityService.translate('submitYourContent.FILE_SIZE_EXCEEDED'),
            "FILE_SHOULD_NOT_EXCEED_LIMIT": widgetUtilityService.translate('submitYourContent.FILE_SHOULD_NOT_EXCEED_LIMIT'),
            "FORTISOAR_CONTENTHUB_INVITE_USERS": widgetUtilityService.translate('submitYourContent.FORTISOAR_CONTENTHUB_INVITE_USERS'),
            "LETS_GET_STARTED": widgetUtilityService.translate('submitYourContent.LETS_GET_STARTED'),
            "NAME": widgetUtilityService.translate('submitYourContent.NAME'),
            "ORGANIZATION_NAME": widgetUtilityService.translate('submitYourContent.ORGANIZATION_NAME'),
            "PLEASE_NOTE_THIS_PROCESS_MAY_TAKE": widgetUtilityService.translate('submitYourContent.PLEASE_NOTE_THIS_PROCESS_MAY_TAKE'),
            "PLEASE_PROVIDE_YOUR_DETAILS_AND_CONTENT_INFORMATION": widgetUtilityService.translate('submitYourContent.PLEASE_PROVIDE_YOUR_DETAILS_AND_CONTENT_INFORMATION'),
            "SELECT_AN_OPTION": widgetUtilityService.translate('submitYourContent.SELECT_AN_OPTION'),
            "SELECT_AN_OUTPUT": widgetUtilityService.translate('submitYourContent.SELECT_AN_OUTPUT'),
            "SELECT_FROM_CREATED_SOLUTION": widgetUtilityService.translate('submitYourContent.SELECT_FROM_CREATED_SOLUTION'),
            "SELECT_SOLUTION": widgetUtilityService.translate('submitYourContent.SELECT_SOLUTION'),
            "SEE_DETAILS_AND_NEXT_STEPS": widgetUtilityService.translate('submitYourContent.SEE_DETAILS_AND_NEXT_STEPS'),
            "SOLUTION_CATEGORY": widgetUtilityService.translate('submitYourContent.SOLUTION_CATEGORY'),
            "SOLUTION_DETAILS": widgetUtilityService.translate('submitYourContent.SOLUTION_DETAILS'),
            "SOLUTION_TITLE": widgetUtilityService.translate('submitYourContent.SOLUTION_TITLE'),
            "SUBMIT_CONTENT": widgetUtilityService.translate('submitYourContent.SUBMIT_CONTENT'),
            "SUBMITTER_DETAILS": widgetUtilityService.translate('submitYourContent.SUBMITTER_DETAILS'),
            "SUBMIT_YOUR_CONTENT": widgetUtilityService.translate('submitYourContent.SUBMIT_YOUR_CONTENT'),
            "THANK_FOR_YOUR_VALUABLE_CONTRIBUTION": widgetUtilityService.translate('submitYourContent.THANK_FOR_YOUR_VALUABLE_CONTRIBUTION'),
            "UPON_SUBMISSION": widgetUtilityService.translate('submitYourContent.UPON_SUBMISSION'),
            "UPON_SUBMISSION_EMAIL_TRIGGERED": widgetUtilityService.translate('submitYourContent.UPON_SUBMISSION_EMAIL_TRIGGERED'),
            "UPON_SUCCESSFUL_SUBMISSION": widgetUtilityService.translate('submitYourContent.UPON_SUCCESSFUL_SUBMISSION'),
            "UPLOAD_A_CUSTOM_FILE": widgetUtilityService.translate('submitYourContent.UPLOAD_A_CUSTOM_FILE'),
            "UPLOAD_CONTENT": widgetUtilityService.translate('submitYourContent.UPLOAD_CONTENT'),
            "UPLOAD_FAILED": widgetUtilityService.translate('submitYourContent.UPLOAD_FAILED'),
            "WELCOME": widgetUtilityService.translate('submitYourContent.WELCOME'),
            "WE_APPRECIATE_YOUR_CONTRIBUTION": widgetUtilityService.translate('submitYourContent.WE_APPRECIATE_YOUR_CONTRIBUTION'),
            "WHAT_TO_EXPECT_NEXT": widgetUtilityService.translate('submitYourContent.WHAT_TO_EXPECT_NEXT'),
            "OR_CLICK_TO_USE_STD": widgetUtilityService.translate('submitYourContent.OR_CLICK_TO_USE_STD')
          }
        })
      }
    }


    function uploadFiles(file) {
      // Filter out folders from the selected files
      $scope.enableSpinner = true;
      if (file.size < maxFileSize) {
        if (file.type) {
          file.upload = Upload.upload({
            url: API.BASE + 'files',
            data: {
              file: file
            }
          });
          $scope.loadingJob = true;
          file.upload.then(function (response) {
            $scope.fileMetadata = response.data;
            $scope.fileName = response.data.filename;
            $scope.loadingJob = false;
            $scope.uploadedFileFlag = true;
            $scope.enableSpinner = false;
            if ($scope.showCreatedSolutions === 'created') {
              submitContentFormService.triggerPlaybook($scope);
            }
          },
            function (response) {
              $scope.loadingJob = false;
              if (response.status > 0) {
                $log.debug(response.status + ': ' + response.data);
              }
              var message = $scope.viewWidgetVars.UPLOAD_FAILED;
              if (response.status === 413) {
                message = $scope.viewWidgetVars.FILE_SIZE_EXCEEDED;
              }
              $scope.enableSpinner = false;
              toaster.error({ body: message });
            });
        }
      }
      else {
        $scope.enableSpinner = false;
        toaster.error({ body: $scope.viewWidgetVars.FILE_SIZE_EXCEEDED });
      }
    }

    function openDocumentation(){
      $window.open('https://github.com/fortinet-fortisoar/widget-submit-content-form/blob/release/1.0.0/docs/usage.md#prompting-tips', '_blank');
    }

    function minimize() {
      const customModal = document.getElementById('custom-modal');
      customModal.setAttribute('style', 'display:none;');
      $scope.submitContentFormForm.$setPristine();
      $scope.submitContentFormForm.$setUntouched();
    }

    function moveToStep(stepNumber) {
      //$scope.currentStep = 3
      if ($scope.currentStep != 3) { $scope.currentStep = stepNumber; }
    }

    function cancel() {
      delete $scope.submitFormFlag;
      delete $scope.uploadedFile;
      delete $scope.user.fullName
      delete $scope.user.emailId;
      $scope.user = {
        organizationName: ''
      };
      $scope.solutionDetails = '';
      $scope.user = {
        solutionTitle: ''
      };
      $scope.uploadedFileFlag = null;
      $scope.selectedSolution.selectedSolution = '';
      $scope.currentStep = 1;
      const customModal = document.getElementById('custom-modal');
      customModal.setAttribute('style', 'display:none;');
      $scope.submitContentFormForm.$setPristine();
      $scope.submitContentFormForm.$setUntouched();
    }


    function submit() {
      if ($scope.submitContentFormForm.$invalid) {
        $scope.submitContentFormForm.$setTouched();
        $scope.submitContentFormForm.$focusOnFirstError();
        return;
      }
      $scope.submitFormFlag = true;
      if ($scope.showCreatedSolutions === 'created') {
        $scope.selectedSolution.selectedSolution = JSON.parse($scope.selectedSolution.selectedSolution);
        submitContentFormService.exportSolution(angular.copy($scope.selectedSolution.selectedSolution), $scope);
      }
      else {
        if(!$scope.uploadedFileFlag){
          $scope.submitFormFlag = false;
          var uploadFileDiv = document.getElementsByName('uploadFileDiv');
          for (var i = 0; i < uploadFileDiv.length; i++) {
            uploadFileDiv[i].setAttribute('style', 'border: 2px dashed #da393d;');
          }
          return;
        }
        submitContentFormService.triggerPlaybook($scope);
      }
    }
  }
})();
