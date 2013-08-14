/* global define: true */

define(
  [
    "backbone",
    "jquery",
    "text!campaigns-modal-view-template",
    "bootstrap"
  ],
  function(
    Backbone,
    $,
    CampaignsModalViewTemplate) {

    "use strict";

    var CampaignsModalView = Backbone.View.extend({

      initialize: function() {
        this.render();
      },

      render: function() {
        $("body").append(CampaignsModalViewTemplate);
      },

      hide: function() {
        $("#campaigns-modal-view").modal("hide");
      },

      show: function() {
        this.fill();
        $("#campaigns-modal-view").modal("show");
      },

      fill: function() {

        var template = $("#campaigns-modal-radio-template").html();

        var self = this;
        $
        .ajax({
          url: "http://generator/sitecore modules/Shell/Sitecore.Analytics.DataGenerator/api/campaigns.aspx"
        })
        .done(function(data, textStatus, jqXHR) {
          console.log(
          {
            data: data,
            textStatus: textStatus,
            jqXHR: jqXHR
          });

          var modalBody = $("#campaigns-modal-view-body");

          modalBody.empty();

          for (var i = 0; i < data.length; i++) {
            // data[i]
            modalBody.append(_.template(template, data[i]));
          };
        })
        .fail(function() {
          alert("error");
        });
      }

    });

    return CampaignsModalView;
  }
);