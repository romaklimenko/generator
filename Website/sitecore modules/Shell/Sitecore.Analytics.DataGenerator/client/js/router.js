/* global define: true */

define(
  [
    "backbone",
    "jquery",
    "default-view"
  ],
  function(
    Backbone,
    $,
    DefaultView) {

    "use strict";

    var defaultView;

    var Router = Backbone.Router.extend({
      routes: {
        "":  "default"
      },

      initialize: function() {
        Backbone.history.start();
      },

      default: function() {
        defaultView = new DefaultView({
          el: $("#app")
        });
        defaultView.render();
      }
    });

    var router = new Router();

    return router;
  }
);