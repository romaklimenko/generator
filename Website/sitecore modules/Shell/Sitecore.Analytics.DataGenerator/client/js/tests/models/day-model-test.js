/* global define: true */
/* global describe: true */
/* global it: true */

define(["main", "../../js/vendor/chai.js", "../../models/day-model"],
  function(Main, Chai, DayModel) {
    "use strict";

    var assert = Chai.assert;

    describe("DayModel", function() {
      describe("#constructor()", function() {
        it("creates a day model with default values", function() {
          var dayModel = new DayModel();
          assert.isObject(dayModel);
          assert.equal(dayModel.get("visits"), 0);
          assert.equal(dayModel.get("value"), 0);
        });
      });

      describe("#getValuePerVisit()", function() {
        it("returns 0 if there are no visits", function() {
          var dayModel = new DayModel();
          assert.equal(dayModel.getValuePerVisit(), 0);
        });

        it("returns 0 if visits < 0 (somehow)", function() {
          var dayModel = new DayModel({ visits: -1 });
          assert.equal(dayModel.get("visits"), -1);
          assert.equal(dayModel.getValuePerVisit(), 0);
        });

        it("returns value / visits if visits > 0", function() {
          var dayModel = new DayModel({ visits: 6, value: 144 });
          assert.equal(dayModel.get("visits"), 6);
          assert.equal(dayModel.get("value"), 144);
          assert.equal(dayModel.getValuePerVisit(), 144 / 6);
        });
      });

      describe("#getDate()", function() {
        it("returns date of the day model", function() {
          var dayModel = new DayModel(
            {
              date: "20130625",
              visits: 5,
              value: 30
            });
          assert.equal(dayModel.getDate().getFullYear(), 2013);
          assert.equal(dayModel.getDate().getMonth(), 6 - 1);
          assert.equal(dayModel.getDate().getDate(), 25);
        });
      });

      describe("DayModel.dateToSqlDateString(date)", function() {
        it("returns universal string date representation", function() {
          var expected = "20130627";
          var actual = DayModel.dateToSqlDateString(new Date("2013-06-27"));
          assert.equal(actual, expected);
        });
      });

      describe("DayModel.sqlDateStringToDate(sqlDateString)", function() {
        it("returns universal string date representation", function() {
          var expected = new Date();
          expected.setHours(0);
          expected.setMinutes(0);
          expected.setSeconds(0);
          expected.setMilliseconds(0);
          var sqlDateString = DayModel.dateToSqlDateString(expected);
          var actual = DayModel.sqlDateStringToDate(sqlDateString);
          assert.deepEqual(actual, expected);
        });
      });
    });
  }
);