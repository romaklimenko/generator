/* global require: true */
/* global requirejs: true */

requirejs.config({
  paths: {
    // vendor
    "backbone": "./vendor/backbone",
    "bootstrap": "./vendor/bootstrap",
    "d3": "./vendor/d3",
    "raphael": "./vendor/raphael",
    "jquery": "./vendor/jquery",
    "underscore": "./vendor/underscore",

    // plugins
    "text": "./vendor/text",

    // resources
    "all": "../json/all.json",
    "campaign": "../json/campaign.json",

    // entry point
    "app": "./app",

    // router
    "router": "./router",

    // models
    "day-model": "./models/day-model",

    // collections
    "days-collection": "./collections/days-collection",

    // views
    "default-view": "./views/default-view",
    "campaigns-modal-view": "./views/campaigns-modal-view",
    "chart-view": "./views/chart-view",

    // templates
    "default-view-template": "../templates/default-view-template.html",
    "campaigns-modal-view-template": "../templates/campaigns-modal-view-template.html"
  },
  shim: {
    "backbone": {
      deps: ["underscore", "jquery"],
      exports: "Backbone"
    },
    "bootstrap": {
      deps: ["jquery"]
    },
    "d3": {
      exports: "d3"
    },
    "raphael": {
      exports: "Raphael"
    },
    "jquery": {
      exports: "$"
    },
    "underscore": {
      exports: "_"
    }
  }
});

require(
  [
    "jquery",
    "app",
    "bootstrap"
  ],
  function($, App) {
    "use strict";

    if ($("#mocha").length > 0){
      return;
    }

    App.initialize();
  }
);