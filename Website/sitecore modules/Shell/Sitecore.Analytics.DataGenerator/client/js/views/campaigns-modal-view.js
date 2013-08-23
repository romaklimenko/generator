/* global define: true */

define(
  [
    "backbone",
    "jquery",
    "underscore",
    "bootstrap"
  ],
  function(
    Backbone,
    $,
    _) {

    "use strict";

    var CampaignsModalView = Backbone.View.extend({

      events: {
        "click .btn-ok": "selectCampaign"
      },

      selectCampaign: function(event) {
        var self = event.data.self;
        self.trigger(
          "campaign:selected",
          {
            CampaignId: $("#campaigns-modal-view-body > div.radio > label > input:checked").attr("id"),
            CampaignPath: $("#campaigns-modal-view-body > div.radio > label > input:checked").val()
          });
        event.data.self.hide();
      },

      initialize: function() {
        this.setElement($("#campaigns-modal-view"));
      },

      hide: function() {
        $("#campaigns-modal-view").modal("hide");
      },

      show: function(sender) {

        $("#campaigns-modal-view")
          .unbind("click")
          .on("click", ".btn-ok", { self: this }, this.selectCampaign);

        this.fill(sender);

        $("#campaigns-modal-view").modal("show");
      },

      fill: function(params) {

        var selectedCampaignId;

        if (params) {
          selectedCampaignId = params.selectedCampaignId;
        }

        var template = $("#campaigns-modal-radio-template").html();

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
            modalBody.append(_.template(template, data[i]));
            if (i === 0) {
              $("#campaigns-modal-view-body > div.radio > label > input").first().attr('checked', true);
            }
          }

          if (params && params.selectedCampaignId) {
            $("input#" + selectedCampaignId + ":radio[name='optionsRadios']").attr('checked', 'checked');
          }
        })
        .fail(function() {
          alert("error");
        });
      }

    });

    return CampaignsModalView;
  }
);