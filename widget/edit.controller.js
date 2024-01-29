/* Copyright start
  Copyright (C) 2008 - 2023 Fortinet Inc.
  All rights reserved.
  FORTINET CONFIDENTIAL & FORTINET PROPRIETARY SOURCE CODE
  Copyright end */
  'use strict';
  (function () {
      angular
          .module('cybersponse')
          .controller('editCommunitySubmission100Ctrl', editCommunitySubmission100Ctrl);
  
      editCommunitySubmission100Ctrl.$inject = ['$scope', '$uibModalInstance', 'config'];
  
      function editCommunitySubmission100Ctrl($scope, $uibModalInstance, config) {
          $scope.cancel = cancel;
          $scope.save = save;
          $scope.config = config;
  
          function cancel() {
              $uibModalInstance.dismiss('cancel');
          }
  
          function save() {
              $uibModalInstance.close($scope.config);
          }
  
      }
  })();
  