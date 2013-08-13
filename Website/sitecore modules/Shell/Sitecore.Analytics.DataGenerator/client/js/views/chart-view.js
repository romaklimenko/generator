/* global define: true */
/* global _: true */

define(["jquery", "backbone", "raphael"], function($, Backbone, Raphael) {
  "use strict";

  // ## Chart View
  // It knows how to display Visits, Value and Value per Visit.
  // It renders draggable dots on Visits and Value lines.
  // You can drag these dots to change models.
  var ChartView = Backbone.View.extend({

    // How many points should be shown on each chart's line.
    pointsInLine: 8,

    // Chart's margin. It makes sence only for lines. Scales can be placed
    // inside margin area.
    margin:
    {
      top: 50,
      right: 50,
      bottom: 50,
      left: 55
    },

    // We look for maximum attribute value to render lines in proper scale,
    // but if maximum attribute value is to small, it's good to increase it
    // in order to make point drag smoother.
    minimalMax: 50,

    initialize: function() {
      // Make sure whar input collection is uniformly filled.
      this.options.models.complement();
      // Shrink collection to not overload user with big ammount of movable
      // points.
      this.collection = this.options.models.shrink(this.pointsInLine);
    },

    // this.$el.height() is a whole view height but heightMinusMargins()
    // return you a view's height without margins. Sincerely, yours C.O.
    heightMinusMargins: function() {
      return this.$el.height() - this.margin.top - this.margin.bottom;
    },
    // see heightMinusMargins
    widthMinusMargins: function() {
      return this.$el.width() - this.margin.left - this.margin.right;
    },

    render: function() {
      var self = this;

      // Let's start from blank scheet.
      self.$el.empty();

      self.paper = new Raphael(self.el, self.$el.width(), self.$el.height());

      // This is a x-distance between draggable points.
      self.columnWidth =
        Math.floor(self.widthMinusMargins() / self.collection.length);

      self.renderPaths();
    },

    // No time to explain: render paths!
    renderPaths: function() {
      var self = this;

      // visits
      self.renderPath(
        // path name
        "visitsPath",
        {
          color: "#4892D2",
          cursor: "move",
          "stroke-width": 4
        },
        // getter
        function(model) {
          return Math.floor(parseInt(model.get("visits"), 10));
        },
        // setter
        function(model, visits) {
          model.set("visits", visits);
        });

      // value
      self.renderPath(
        // path name
        "valuesPath",
        {
          color: "#FAD500",
          cursor: "move",
          "stroke-width": 4
        },
        // getter
        function(model) {
          return Math.floor(parseInt(model.get("value"), 10));
        },
        // setter
        function(model, value) {
          model.set("value", value);
        });

      // value per visit
      self.renderPath(
        // path name
        "valuePerVisitPath",
        {
          color: "#4CB849",
          cursor: "hand",
          "stroke-width": 2
        },
        // getter
        function(model) {
          var visits = parseInt(model.get("visits"), 10);
          var value = parseInt(model.get("value"), 10);
          if (visits > 0) {
            return Math.floor(value / visits);
          }
          else {
            return 0;
          }
        }
        // threre are no setter here because Value per Visit is calculated based on
        // Value and Visits
      );
    },

    getAnchors: function(p1x, p1y, p2x, p2y, p3x, p3y) {
      // Every time I see this code I tryind to remember what it means.
      // In short, it takes 3 points coordinates: previous dot in chart's line,
      // current point and the next point.
      // Then it makes some trigonometry and returns two points.
      // If you link these points by line, the (p2x, p2y) point
      // will be in the middle of this line.
      // I took this code here, BTW:
      // https://github.com/DmitryBaranovskiy/g.raphael/blob/master/g.line.js
      var l1 = (p2x - p1x) / 2;
      var l2 = (p3x - p2x) / 2;

      var a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y));
      var b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));

      if (p1y < p2y) {
        a = Math.PI - a;
      }

      if (p3y < p2y) {
        b = Math.PI - b;
      }

      var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2;

      var dx1 = l1 * Math.sin(alpha + a);
      var dy1 = l1 * Math.cos(alpha + a);
      var dx2 = l2 * Math.sin(alpha + b);
      var dy2 = l2 * Math.cos(alpha + b);

      return {
        x1: p2x - dx1,
        y1: p2y + dy1,
        x2: p2x + dx2,
        y2: p2y + dy2
      };
    },

    // This renders a line, a draggable dots on this line and the other stuff
    // related to (separately) Visits, Value or Value per Visit.
    renderPath: function(pathName, attributes, getter, setter) {
      var self = this;

      // Find maximum value of given model attribute.
      var maxModelAttributeValue =
        Math.max(
          getter(_.max(
            self.collection.models,
            function(model) {
              return parseInt(getter(model), 10);
            })),
          self.minimalMax);

      // How much y increases if we increase model attribute by 1
      var yPerModel =
        self.heightMinusMargins() /
          maxModelAttributeValue;

      // The x-distance between two draggable points.
      var xPerModel = self.widthMinusMargins() /
        (self.collection.models.length - 1);

      // Create a path an set its style.
      var path = self.paper.path().attr({
        stroke: attributes.color,
        "stroke-width": attributes["stroke-width"],
        "stroke-linejoin": "round"
      });

      var p, x, y;

      // Move through all the models in view's collection.
      for (var i = 0; i < self.collection.models.length; i++) {

        // Remember dots in getAnchors? That's why we need three models.
        var prevModel = self.collection.models[i - 1];
        var model = self.collection.models[i];
        var nextModel = self.collection.models[i + 1];

        // Get current draggable point coordinates.
        y = self.heightMinusMargins() -
          yPerModel * getter(model) + self.margin.top;
        x = xPerModel * i + self.margin.left;

        if (i === 0) {
          // First time here? Try to start a path.
          p = ["M", x, y, "C", x, y];
        }
        else if (i !== 0 && i < self.collection.models.length - 1) {
          // y of previous point in line
          var Y0 = self.heightMinusMargins() -
            yPerModel * getter(prevModel);
          // x of prevous point in line
          var X0 = xPerModel * (i - 1);
          // y of next point in line
          var Y2 = self.heightMinusMargins() -
            yPerModel * getter(nextModel);
          // x of next point in line
          var X2 = xPerModel * (i + 1);

          var a = self.getAnchors(X0, Y0, x, y, X2, Y2);

          p = p.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
        }

        if (setter !== undefined) {
          // We dont't draw draggable dots if we don't have a setter.
          // Because we don't know how to handle such drags.
          self.renderDot(x, y, i, attributes, model, yPerModel, setter);
        }
      }
      // The last path's span.
      p = p.concat([x, y, x, y]);

      // Add array to our path and move it (path) to back (to not cover
      // the dots).
      path.attr({
        path: p
      }).toBack();

      // save a link to path (we need it do delete this path later).
      self[pathName] = path;

      self.renderScales();
    },

    removePath: function(pathName) {
      var path = this[pathName];
      if (path !== undefined && path.remove !== undefined) {
        path.remove();
      }
    },

    renderDot: function(x, y, i, attributes, model, yPerModel, setter) {
      var self = this;

      var currentY;

      var radius = 5;

      self.paper
        .circle(x, y, radius)
        .data("models-i", i)
        .attr(
        {
          cursor: attributes.cursor,
          fill: "#FFF",
          stroke: attributes.color,
          "stroke-width": 3,
          "title": "Visits: " + model.get("visits") +
            "\nValue: " + model.get("value") +
            "\nValue per Visit: " +
              model.getValuePerVisit() +
            "\nDate: " + model.id
        })
        .drag(
          //onmove
          function(dx, dy) {
            var circle = this;

            function getAttributeValue() {
              var cy = currentY + dy;

              if (self.heightMinusMargins() + self.margin.top - cy < 0) {
                cy = self.heightMinusMargins() + self.margin.top;
              }

              var attributeValue = Math.floor(
                (self.heightMinusMargins() - cy + self.margin.top) /
                  yPerModel);

              return attributeValue;
            }

            var attributeValue = getAttributeValue();

            setter(
              self.collection.models[circle.data("models-i")],
              attributeValue);

            self.paper.forEach(function (el) {
              if (el.type === "circle") {
                el.hide();
              }
            });

            self.removePath("visitsPath");
            self.removePath("valuesPath");
            self.removePath("valuePerVisitPath");

            self.renderPaths();
            self.renderScales();
          },
          //onstart
          function() {
            currentY = this.attr("cy");
          },
          // onend
          function() {
            self.render();
          })
        .toBack();
    },

    renderLine: function(x0, y0, x1, y1) {
      return this.paper.path("M" + x0 + "," + y0 + "L" + x1 + "," + y1);
    },

    renderScales: function() {
      this.renderVisitsScale();
      this.renderValueScale();
      this.renderValuePerVisitScale();
    },

    renderVisitsScale: function() {
      var self = this;

      // todo: this should be a single path

      // vertical scale line
      self.renderLine(
          // x0
          Math.floor(self.margin.left / 2),
          // y0
          self.margin.bottom,
          // x1
          Math.floor(self.margin.left / 2),
          // y1
          self.margin.bottom + self.heightMinusMargins())
        .attr(
        {
          stroke: "#4892D2",
          "stroke-width": 4
        });

      // upper horizontal line
      self.renderLine(
          // x0
          Math.floor(self.margin.left / 2),
          // y0
          self.margin.bottom + 2,
          // x1
          Math.floor(self.margin.left / 2) - 5,
          // y1
          self.margin.bottom + 2)
        .attr(
        {
          stroke: "#4892D2",
          "stroke-width": 4
        });

      // bottom horizontal line
      self.renderLine(
          // x0
          Math.floor(self.margin.left / 2),
          // y0
          self.margin.bottom + self.heightMinusMargins() - 2,
          // x1
          Math.floor(self.margin.left / 2) - 5,
          // y1
          self.margin.bottom + self.heightMinusMargins() - 2)
        .attr(
        {
          stroke: "#4892D2",
          "stroke-width": 4
        });

      if (self.paper.maxVisitsText !== undefined) {
        self.paper.maxVisitsText.remove();
      }

      self.paper.maxVisitsText = self.paper.text(
          // x
          Math.floor(self.margin.left / 2) - 12,
          // y
          self.margin.top,
          // text
          Math.max(
            self.minimalMax,
            _.max(
              self.collection.models,
              function(model) {
                return parseInt(model.get("visits"), 10);
              }).get("visits")))
        .rotate(-90)
        .attr(
        {
          "color": "#565d64",
          "text-anchor": "end",
          "font-size": 14
        });

      if (self.paper.zeroVisitsText === undefined) {
        self.paper.zeroVisitsText = self.paper.text(
          // x
          Math.floor(self.margin.left / 2) - 12,
          // y
          self.margin.top + self.heightMinusMargins(),
          // text
          "0")
        .rotate(-90)
        .attr(
        {
          "color": "#565d64",
          "text-anchor": "start",
          "font-size": 14
        });
      }
    },

    renderValueScale: function() {
      var self = this;

      // todo: this should be a single path

      // vertical scale line
      self.renderLine(
          // x0
          Math.floor(this.margin.left / 2) + 4,
          // y0
          self.margin.bottom,
          // x1
          Math.floor(self.margin.left / 2) + 4,
          // y1
          self.margin.bottom + self.heightMinusMargins())
        .attr(
        {
          stroke: "#FAD500",
          "stroke-width": 4
        });

      // upper horizontal line
      self.renderLine(
          // x0
          Math.floor(self.margin.left / 2) + 4,
          // y0
          self.margin.bottom + 2,
          // x1
          Math.floor(self.margin.left / 2) + 9,
          // y1
          self.margin.bottom + 2)
        .attr(
        {
          stroke: "#FAD500",
          "stroke-width": 4
        });

      // bottom horizontal line
      self.renderLine(
          // x0
          Math.floor(self.margin.left / 2) + 4,
          // y0
          self.margin.bottom + self.heightMinusMargins() - 2,
          // x1
          Math.floor(self.margin.left / 2) + 9,
          // y1
          self.margin.bottom + self.heightMinusMargins() - 2)
        .attr(
        {
          stroke: "#FAD500",
          "stroke-width": 4
        });

      if (self.paper.maxValueText !== undefined) {
        self.paper.maxValueText.remove();
      }

      self.paper.maxValueText = self.paper.text(
          // x
          Math.floor(self.margin.left / 2) + 15,
          // y
          self.margin.top,
          // text
          Math.max(
            self.minimalMax,
            _.max(
              self.collection.models,
              function(model) {
                return parseInt(model.get("value"), 10);
              }).get("value")))
        .rotate(-90)
        .attr(
        {
          "color": "#565d64",
          "text-anchor": "end",
          "font-size": 14
        });

      if (self.paper.zeroValueText === undefined) {
        self.paper.zeroValueText = self.paper.text(
          // x
          Math.floor(self.margin.left / 2) + 15,
          // y
          self.margin.top + self.heightMinusMargins(),
          // text
          "0")
        .rotate(-90)
        .attr(
        {
          "color": "#565d64",
          "text-anchor": "start",
          "font-size": 14
        });
      }
    },

    renderValuePerVisitScale: function() {
      var self = this;

      // todo: this should be a single path

      // vertical scale line
      self.renderLine(
          // x0
          this.margin.left + this.widthMinusMargins() +
            Math.floor(this.margin.right / 2),
          // y0
          self.margin.bottom,
          // x1
          this.margin.left + this.widthMinusMargins() +
            Math.floor(this.margin.right / 2),
          // y1
          self.margin.bottom + self.heightMinusMargins())
        .attr(
        {
          stroke: "#4CB849",
          "stroke-width": 1
        });

      // upper horizontal line
      self.renderLine(
          // x0
          this.margin.left + this.widthMinusMargins() +
            Math.floor(this.margin.right / 2),
          // y0
          self.margin.bottom + 1,
          // x1
          this.margin.left + this.widthMinusMargins() +
            Math.floor(this.margin.right / 2) + 4,
          // y1
          self.margin.bottom + 1)
        .attr(
        {
          stroke: "#4CB849",
          "stroke-width": 1
        });

      // bottom horizontal line
      self.renderLine(
          // x0
          this.margin.left + this.widthMinusMargins() +
            Math.floor(this.margin.right / 2),
          // y0
          self.margin.bottom + self.heightMinusMargins() - 1,
          // x1
          this.margin.left + this.widthMinusMargins() +
            Math.floor(this.margin.right / 2) + 4,
          // y1
          self.margin.bottom + self.heightMinusMargins() - 1)
        .attr(
        {
          stroke: "#4CB849",
          "stroke-width": 1
        });

      if (self.paper.valuePerVisitText !== undefined) {
        self.paper.valuePerVisitText.remove();
      }

      self.paper.valuePerVisitText = self.paper.text(
          // x
          this.margin.left + this.widthMinusMargins() +
            Math.floor(this.margin.right / 2) + 12,
          // y
          self.margin.top,
          // text
          Math.max(
            self.minimalMax,
            _.max(
            self.collection.models,
            function(model) {
              return model.getValuePerVisit();
            }).getValuePerVisit()))
        .rotate(-90)
        .attr(
        {
          "color": "#565d64",
          "text-anchor": "end",
          "font-size": 14
        });

      if (self.paper.zeroValuePerVisitText === undefined) {
        self.paper.zeroValuePerVisitText = self.paper.text(
          // x
          this.margin.left + this.widthMinusMargins() +
            Math.floor(this.margin.right / 2) + 12,
          // y
          self.margin.top + self.heightMinusMargins(),
          // text
          "0")
        .rotate(-90)
        .attr(
        {
          "color": "#565d64",
          "text-anchor": "start",
          "font-size": 14
        });
      }
    }

  });

  return ChartView;
});