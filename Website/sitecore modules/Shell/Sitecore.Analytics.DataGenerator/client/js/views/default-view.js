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
    "chart-view"
  ],
  function(
    Backbone,
    $,
    DayModel,
    DaysCollection,
    AllData,
    CampaignData,
    DefaultViewTemplate,
    ChartView) {

    "use strict";

    var DefaultView = Backbone.View.extend({

      initialize: function() {
        var i;

        // all
        this.allDays = new DaysCollection();

        var allData = JSON.parse(AllData);

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

      render: function() {

        this.$el.html(DefaultViewTemplate);

        var topChartView = new ChartView({
          el: $("#default-view-top-chart"),
          models: this.allDays
        });

        var bottomChartView = new ChartView({
          el: $("#default-view-bottom-chart"),
          models: this.campaignDays
        });

        $(window).resize(function() {
          topChartView.render();
          bottomChartView.render();
        });

        bottomChartView.collection.on("change", function(campaignModel) {
          function delta(model, attribute) {
            return model.get(attribute) - model.previous(attribute);
          }

          var allDataModel = topChartView.collection.get(campaignModel.id);

          allDataModel.set(
            {
              "visits": allDataModel.get("visits") + delta(campaignModel, "visits"),
              "value": allDataModel.get("value") + delta(campaignModel, "value")
            });
          topChartView.render();
        }, this);

        topChartView.render();
        bottomChartView.render();
      }
    });

    return DefaultView;
  }
);