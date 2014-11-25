analytics.charts.map = (function () {
  var map = function (selector, dimensions) {

    var _chart = analytics.charts.chart(selector, dimensions);

    _chart.type = function() {
      return "map";
    };

    _chart._initContainerSpecific = function () {
    };

    _chart._createDcElement = function () {
      _chart._element = dc.geoChoroplethChart(_chart.selector()+' .chart-container');
    };

    _chart._initChartSpecific = function () {
      _chart.element()
        .colorCalculator(function (d) { return d ? _chart.element().colors()(d) : '#ccc'; })

        .projection(d3.geo.mercator());

      var div = d3.select(_chart.selector()).append("div")
        .attr("id", analytics.csts.css.zoom);

      div.append("a")
        .attr("class","btn btn-primary fa fa-search-plus")
        .attr("href","#")
        .on("click", function () { _chart.element().addScale(1.35, 700); return false; });
      div.append("a")
        .attr("class","btn btn-primary fa fa-search-minus")
        .attr("href","#")
        .on("click", function () { _chart.element().addScale(1/1.35, 700); return false; });
    };

    _chart._updateChartSpecific = function () {
      var dimension = _chart.dimensions()[0];
      var members = dimension.getLastSlice();
      var spatialData = transformSpatialMetadata(members, dimension.getGeoProperty().id());

      /// update layers
      var layers = _chart.element().geoJsons();
      var i;
      // remove layers > current level (if so, we most probably rolled up)
      for (i = dimension.currentLevel(); i < layers.length; i++) {
        _chart.element().removeGeoJson(layers[i].name);
      }

      var getId = function (d) {
        return d.id;
      };

      // add layers < current level (if so, we loaded a saved state)
      for (i = layers.length; i < dimension.currentLevel(); i++) {
        var oldMembers = dimension.getSlice(i);
        var oldSpatialData = transformSpatialMetadata(oldMembers, dimension.getGeoProperty().id());
        _chart.element().overlayGeoJson(oldSpatialData, "geolayer-"+i, getId);
      }

      // add new layer
      _chart.element().overlayGeoJson(spatialData, "geolayer-"+dimension.currentLevel(), getId);

      // display data
      var format = d3.format(".3s");

      _chart.element()
        .dimension(dimension.crossfilterDimension())
        .group(dimension.crossfilterGroup())
        .setNbZoomLevels(dimension.maxLevel() + 1)

        .title(function (d) {
          if (members[d.key] === undefined) {
            return (d.value ? format(d.value) : '');
          }

          return members[d.key].caption + "\nValue: " + (d.value ? format(d.value) : 0); // + "[unit]";
        });
    };

    /**
     * TODO not sure if this is used and when this should be
     */
    _chart.resizeSpecific = function () {
      var width = $(_chart.selector()).width() - 30;
      var height = $(_chart.selector()).height();

      _chart.element()
        .width(width)
        .height(height);
    };

    /**
     * Transform metadata from the geographical dimension to a list of GeoJSON.
     *
     * @private
     * @param {Object} data Metadata from the Query class
     * @param {string} geoProperty id of the property containing the geoJSON in the data
     * @return {Array<Object>} list of GeoJSON file with captions of the areas as the "name" property in each GeoJSON
     */
    function transformSpatialMetadata (data, geoProperty) {

      var out = [];
      for (var el in data) {
        var outEl = $.extend({}, data[el][geoProperty]);
        outEl.id = el;
        outEl.properties = {"name" : data[el].caption};

        out.push(outEl);
      }
      return out;
    }

    return _chart;
  };

  map.options = {
    sort            : null,
    height          : 0.7,
    heightReference : 'columnHeightRatio'
  };

  map.isPossibleDimension = function (dimension) {
    return dimension.type() == "Geometry";
  };

  return analytics.charts.chart.extend(map);
})();