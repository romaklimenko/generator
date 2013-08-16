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
        "click .campaign-name": "showCampaignsModal"
      },

      showCampaignsModal: function() {
        this.campaignsModalView.show();
      },

      initialize: function() {

        this.campaignsModalView = new CampaignsModalView();

        this.listenTo(
          this.campaignsModalView,
          'campaign:selected',
          this.setCampaign);

        var i;

        // all
        this.allDays = new DaysCollection();

        var allData = JSON.parse(AllData);
        console.log(AllData);

        for (i = 0; i < allData.length; i++) {
          this.allDays.add(
            new DayModel({
              date: allData[i].date,
              visits: allData[i].visits,
              value: allData[i].value
            })
          );
        }

        // campaign
        this.campaignDays = new DaysCollection();

        var campaignData = JSON.parse(CampaignData);

        for (i = 0; i < campaignData.length; i++) {
          this.campaignDays.add(
            new DayModel({
              date: campaignData[i].date,
              visits: campaignData[i].visits,
              value: campaignData[i].value
            })
          );
        }
      },

      setCampaign: function(data) {
        this.campaign = data;
        this.$el.find(".campaign-name").html(data.CampaignPath);
        this.renderCampaignDataChart();
      },

      render: function() {
        var self = this;

        self.$el.html(DefaultViewTemplate);

        self.renderAllDataChart();

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
      },

      renderAllDataChart: function() {
        var self = this;

        self.topChartView = new ChartView({
          el: $("#default-view-top-chart"),
          models: self.allDays
        });

        $(window).resize(function() {
          self.topChartView.render();
        });

        self.topChartView.render();
      },

      renderCampaignDataChart: function() {
        var self = this;

        self.bottomChartView = new ChartView({
          el: $("#default-view-bottom-chart"),
          models: self.campaignDays
        });

        $(window).resize(function() {
          console.log('resize');
          self.bottomChartView.render();
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

        self.bottomChartView.render();
      }

    });

    return DefaultView;
  }
);