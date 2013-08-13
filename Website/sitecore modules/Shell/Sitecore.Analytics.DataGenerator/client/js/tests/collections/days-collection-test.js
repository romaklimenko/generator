/* global before: true */
/* global define: true */
/* global describe: true */
/* global it: true */

define(["main", "../../js/vendor/chai.js", "day-model", "days-collection"],
  function(Main, Chai, DayModel, DaysCollection) {
    "use strict";

    var assert = Chai.assert;

    before(function() {
      this.daysCollection = new DaysCollection();

      var dayModel0 = new DayModel({ date: "20130101", visits: 1, value: 9 });
      var dayModel1 = new DayModel({ date: "20130102", visits: 2, value: 8 });
      var dayModel2 = new DayModel({ date: "20130103", visits: 3, value: 7 });
      var dayModel3 = new DayModel({ date: "20130104", visits: 4, value: 6 });
      var dayModel4 = new DayModel({ date: "20130105", visits: 5, value: 5 });
      var dayModel5 = new DayModel({ date: "20130106", visits: 6, value: 4 });
      var dayModel6 = new DayModel({ date: "20130107", visits: 7, value: 3 });
      var dayModel7 = new DayModel({ date: "20130108", visits: 8, value: 2 });
      var dayModel8 = new DayModel({ date: "20130109", visits: 9, value: 1 });
      var dayModel9 = new DayModel({ date: "20130110", visits: 0, value: 0 });

      this.daysCollection.add(dayModel0);
      this.daysCollection.add(dayModel1);
      this.daysCollection.add(dayModel2);
      this.daysCollection.add(dayModel3);
      this.daysCollection.add(dayModel4);
      this.daysCollection.add(dayModel5);
      this.daysCollection.add(dayModel6);
      this.daysCollection.add(dayModel7);
      this.daysCollection.add(dayModel8);
      this.daysCollection.add(dayModel9);
    });

    describe("DaysCollection", function() {
      describe("#complement()", function() {
        it("adds missed days from lesser date till today", function() {
          var dayModel1 = new DayModel({ date: "20130101" });
          var dayModel3 = new DayModel({ date: "20130103" });

          var daysCollection = new DaysCollection();
          daysCollection.add([dayModel1, dayModel3]);

          daysCollection.complement();

          var now = new Date();
          now.setMilliseconds(0);
          now.setMinutes(0);
          now.setHours(0);

          assert.equal(
            daysCollection.length,
            Math.round((now - dayModel1.getDate()) / 1000 / 60 / 60 / 24));
        });

        it("should be sorted if complemented", function() {
          var dayModel1 = new DayModel({ date: "20130101" });
          var dayModel3 = new DayModel({ date: "20130103" });

          var daysCollection = new DaysCollection();
          daysCollection.add([dayModel1, dayModel3]);

          daysCollection.complement();

          var now = new Date();
          now.setMilliseconds(0);
          now.setMinutes(0);
          now.setHours(0);

          var previousDate = new Date("1970-01-01");
          var nextDate;

          for (var i = 0; i < daysCollection.models.length; i++) {
            nextDate = daysCollection.models[i].getDate();
            assert.isTrue(previousDate < nextDate);
            previousDate = nextDate;
          }
        });
      });

      describe("#shrink(n)", function() {
        it("should return a collection shrinked to specific number of elements", function() {
          var lengthExpected = 3;
          var shrinkedCollection = this.daysCollection.shrink(lengthExpected);
          assert.equal(lengthExpected, shrinkedCollection.length);
        });

        it("original collection should remain the same", function() {
          var lengthExpected = this.daysCollection.length;
          this.daysCollection.shrink(lengthExpected);
          assert.equal(lengthExpected, this.daysCollection.length);
        });

        it("should contain average values on each element", function() {
          var lengthExpected = 3;
          var shrinkedCollection = this.daysCollection.shrink(lengthExpected);
          // first group:
          // 20130101 1 9
          // 20130102 2 8
          // 20130103 3 7
          // 20130104 4 6
          assert.equal("20130101", shrinkedCollection.models[0].get("date"));
          assert.equal(
            Math.floor((1 + 2 + 3 + 4) / 4),
            shrinkedCollection.models[0].get("visits"));
          assert.equal(
            Math.floor((9 + 8 + 7 + 6) / 4),
            shrinkedCollection.models[0].get("value"));

          // second group:
          // 20130105 5 5
          // 20130106 6 4
          // 20130107 7 3
          // 20130108 8 2
          assert.equal("20130105", shrinkedCollection.models[1].get("date"));
          assert.equal(
            Math.floor((5 + 6 + 7 + 8) / 4),
            shrinkedCollection.models[1].get("visits"));
          assert.equal(
            Math.floor((5 + 4 + 3 + 2) / 4),
            shrinkedCollection.models[1].get("value"));

          // third group:
          // 20130109 9 1
          // 20130110 0 0
          assert.equal("20130109", shrinkedCollection.models[2].get("date"));
          assert.equal(
            Math.floor(9 / 2),
            shrinkedCollection.models[2].get("visits"));
          assert.equal(
            Math.floor(1 / 2),
            shrinkedCollection.models[2].get("value"));
        });
      });
    });
  }
);