'use strict'

angular.module('product', ['ngResource'])
    .controller('ThumbnailsEditorController', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
        $rootScope.$on('thumbnails:edit', function(event, image) {
            $scope.image = image;
        });
    }])

    .controller('ProductController', ['$scope', '$rootScope', '$routeParams', '$resource', '$location', 'catalogService',
    function ($scope, $rootScope, $routeParams, $resource, $location, catalogService) {

        $scope.slug = $routeParams.product;

        $scope.updateProduct = function () {
            if ($scope.isNew()) {
                $resource("/api/1.0/product/").save($scope.product, function (response) {
                    $location.path(response.href);
                });
            }
            else {
                $scope.ProductResource.save({ "slug":$scope.slug }, $scope.product);
                angular.forEach($scope.categories, function (category) {
                    if (category.hasProduct && !category.hadProduct) {
                        $scope.categoryOperation(category, "addProduct");
                    }
                    if (category.hadProduct && !category.hasProduct) {
                        $scope.categoryOperation(category, "removeProduct");
                    }
                });
            }
        };

        $scope.editThumbnails = function(image) {
            $rootScope.$broadcast('thumbnails:edit', image);
        }

        $scope.categoryOperation = function (category, operation) {
            $resource("/api/1.0/category/:slug/:operation", {"slug":category.slug, "operation" : operation}, {
                "save":{
                    method:'POST',
                    headers:{
                        'Content-Type':'application/x-www-form-urlencoded'
                    }
                }
            }).save("product=" + $scope.product.slug, function () { });
        };

        $scope.ProductResource = $resource("/api/1.0/product/:slug");

        $scope.isNew = function () {
            return $scope.slug == "_new";
        };

        $scope.newProduct = function () {
            return {
                slug:"",
                title:""
            };
        }

        $scope.reloadImages = function() {
            // FIXME Attachment => Images
            $scope.product.images = $resource("/api/1.0/product/:slug/attachment").get({
                "slug": $scope.slug
            });
        }

        $scope.getImageUploadUri = function() {
            return "/api/1.0/product/" + $scope.slug + "/attachment";
        }

        $scope.initializeCategories = function () {
            catalogService.listCategories(function (categories) {
                $scope.categories = categories;
                angular.forEach($scope.categories, function (category) {
                    angular.forEach($scope.product.categories, function (c) {
                        if (category.href == c.href) {
                            // hasProduct => used as model
                            category.hasProduct = true
                            // hadProduct => used when saving to see if we need to update anything
                            category.hadProduct = true
                        }
                        else if (!category.hasProduct) {
                            category.hasProduct = false;
                            category.hadProduct = false;
                        }
                    });
                });
            });
        }

        if (!$scope.isNew()) {
            $scope.product = $scope.ProductResource.get({
                "slug": $scope.slug,
                "expand": ["categories", "images"] }, function () {
                // Ensures the category initialization happens after the AJAX callback
                $scope.initializeCategories();
            });
        }
        else {
            $scope.product = $scope.newProduct();
        }

    }]);
