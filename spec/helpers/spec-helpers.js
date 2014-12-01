beforeEach(function() {
    d3.select("body").append("div").attr("id", "test-content");
    jasmine.clock().install();
});

afterEach(function () {
    dc.deregisterAllCharts();
    dc.renderlet(null);
    d3.selectAll("#test-content").remove();
    jasmine.clock().uninstall();
});

function appendChartID(id) {
    return d3.select("#test-content").append("div").attr("id", id);
}

