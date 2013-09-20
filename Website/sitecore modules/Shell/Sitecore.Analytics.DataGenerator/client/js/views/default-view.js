/* global define: true */
/* global window: true */

define(
  [
    "backbone",
    "jquery",
    "day-model",
    "days-collection",
    "text!all",
    "text!campaign",
    "text!default-view-template",
    "chart-view",
    "campaigns-modal-view",
  ],
  function(
    Backbone,
    $,
    DayModel,
    DaysCollection,
    AllData,
    CampaignData,
    DefaultViewTemplate,
    ChartView,
    CampaignsModalView) {

    "use strict";

    var DefaultView = Backbone.View.extend({

      events: {
        "click .campaign-name": "showCampaignsModal",
        "click .btn-reset": "reset",
        "click .btn-generate": "generate"
      },

      generate: function() {
        var self = this;

        $("#progress-modal-view").modal("show");

        $
        .ajax({
          url: "http://generator/sitecore modules/Shell/Sitecore.Analytics.DataGenerator/api/Generator.aspx",
          type: "POST",
          data:
          {
            data: JSON.stringify(self.bottomChartView.collection.toJSON()),
            campaignId: this.campaign.CampaignId
          }
        })
        .done(function(data, textStatus, jqXHR) {
          $("#progress-modal-view").modal("hide");
          self.renderAllDataChart();
          self.renderCampaignDataChart();
          console.log(
          {
            data: data,
            textStatus: textStatus,
            jqXHR: jqXHR
          });
        });
      },

      showCampaignsModal: function() {
        this.campaignsModalView.show(
          {
            selectedCampaignId: this.campaign.CampaignId
          });
      },

      initialize: function() {

        this.campaignsModalView = new CampaignsModalView();

        this.listenTo(
          this.campaignsModalView,
          "campaign:selected",
          this.setCampaign);
      },

      setCampaign: function(data) {
        this.campaign = data;
        this.$el.find(".campaign-name").html(data.CampaignPath);
        this.renderAllDataChart();
        this.renderCampaignDataChart();
      },

      render: function() {
        var self = this;

        self.$el.html(DefaultViewTemplate);

        self.renderAllDataChart();
      },

      renderAllDataChart: function() {
        var self = this;

        $
        .ajax({
          url: "http://generator/sitecore modules/Shell/Sitecore.Analytics.DataGenerator/api/visits.aspx"
        })
        .done(function(data, textStatus, jqXHR) {
          console.log(
          {
            data: data,
            textStatus: textStatus,
            jqXHR: jqXHR
          });

          // all
          self.allDays = new DaysCollection();

          for (var i = 0; i < data.length; i++) {
            self.allDays.add(
              new DayModel({
                date: data[i].Date,
                visits: data[i].Visits,
                value: data[i].Value
              })
            );
          }

          console.log(self.allDays);

          if (!self.campaign) {
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
              self.setCampaign(data[0]);
            })
            .fail(function() {
              alert("error");
            });
          }

          self.topChartView = new ChartView({
            el: $("#default-view-top-chart"),
            models: self.allDays
          });

          $(window).resize(function() {
            self.topChartView.render();
          });

          self.topChartView.render();

        })
        .fail(function() {
          alert("error");
        });
      },

      renderCampaignDataChart: function() {
        var self = this;

        $
        .ajax({
          url: "http://generator/sitecore modules/Shell/Sitecore.Analytics.DataGenerator/api/visits.aspx",
          data: {
            "campaignId": self.campaign.CampaignId
          }
        })
        .done(function(data, textStatus, jqXHR) {
          console.log(
          {
            data: data,
            textStatus: textStatus,
            jqXHR: jqXHR
          });

          // campaign
          self.campaignDays = new DaysCollection();

          for (var i = 0; i < data.length; i++) {
            self.campaignDays.add(
              new DayModel({
                date: data[i].Date,
                visits: data[i].Visits,
                value: data[i].Value
              })
            );
          }

          if (self.campaignDays.get(self.allDays.first().id) === undefined) {
            self.campaignDays.add(
              new DayModel({
                date: self.allDays.first().id,
                visits: 0,
                value: 0
              }));
          };

          if (self.campaignDays.get(self.allDays.last().id) === undefined) {
            self.campaignDays.add(
              new DayModel({
                date: self.allDays.last().id,
                visits: 0,
                value: 0
              }));
          };

          self.bottomChartView = new ChartView({
            el: $("#default-view-bottom-chart"),
            models: self.campaignDays
          });

          self.bottomChartView.collection.on("change", function(campaignModel) {
            function delta(model, attribute) {
              return model.get(attribute) - model.previous(attribute);
            }

            var allDataModel = self.topChartView.collection.get(campaignModel.id);

            allDataModel.set(
              {
                "visits": allDataModel.get("visits") + delta(campaignModel, "visits"),
                "value": allDataModel.get("value") + delta(campaignModel, "value")
              });
            self.topChartView.render();
          }, self);

          $(window).resize(function() {
            console.log('resize');
            self.bottomChartView.render();
          });

          self.bottomChartView.render();
        })
        .fail(function() {
          alert("error");
        });
      },

      reset: function() {
        this.renderAllDataChart();
        this.renderCampaignDataChart();
      }

    });

    return DefaultView;
  }
);