/* global define: true */

define(["backbone"], function(Backbone) {
  "use strict";

  var DayModel = Backbone.Model.extend({
    idAttribute: "date",

    defaults: {
      "date": "",
      "visits": 0,
      "value": 0
    },

    getDate: function() {
      return DayModel.sqlDateStringToDate(this.id);
    },

    getValuePerVisit: function() {
      if (this.get("visits") > 0) {
        return Math.floor(parseInt(this.get("value"), 10) / parseInt(this.get("visits"), 10));
      }
      else {
        return 0;
      }
    }
  });

  DayModel.dateToSqlDateString = function(date) {
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    return "" + year +  // yyyy
      (month <= 9 ? "0" + month : month) + // MM
      (day <= 9 ? "0" + day : day); // dd
  };

  DayModel.sqlDateStringToDate = function(sqlDateString) {
    var utcDateString =
      sqlDateString.substr(0, 4) + "-" +
      sqlDateString.substr(4, 2) + "-" +
      sqlDateString.substr(6, 2);
    var date = new Date(utcDateString);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
  };

  return DayModel;
});