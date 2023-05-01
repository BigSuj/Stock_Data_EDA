d3.csv("dow_jones_index.csv").then(data => {
    data.forEach(d => {
        d.date = d3.timeParse("%m/%d/%Y")(d.date);
        d.open = parseFloat(d.open.slice(1));
        d.high = parseFloat(d.high.slice(1));
        d.low = parseFloat(d.low.slice(1));
        d.close = parseFloat(d.close.slice(1));
        d.volume = +d.volume;
    });
    const stocks = Array.from(new Set(data.map(d => d.stock)));
    const stockSelect = d3.select("#stockSelect");
    stocks.forEach(stock => {
        stockSelect.append("option")
            .attr("value", stock)
            .text(stock);
    });
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.close)])
        .range([height, 0]);
    
    const updateYScaleDomain = (stockData) => {
        yScale.domain([d3.min(stockData, d => d.close), d3.max(stockData, d => d.close)]);
        };

    const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickSizeOuter(0);
    
    const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickSizeOuter(0)
        .tickSizeInner(-width);
    
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .text("Date");
    
    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .append("text")
        .attr("class", "axis-label")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("fill", "black")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Closing Price");
    const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.close))
    .curve(d3.curveMonotoneX);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

function drawLine(stock) {
    const stockData = data.filter(d => d.stock === stock);
    updateYScaleDomain(stockData);

    svg.append("path")
        .datum(stockData)
        .attr("class", "line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", colorScale(stock)) // assign color based on stock
        .attr("stroke-width", 2);
}
    
    const initialStock = stocks[0];
    drawLine(initialStock);

    function updateLine(stock) {
        const stockData = data.filter(d => d.stock === stock);
        updateYScaleDomain(stockData);
        yAxis.scale(yScale)
        svg.select('.y-axis').call(yAxis);
    
        svg.selectAll(".line")
            .datum(stockData)
            .transition()
            .attr("stroke", colorScale(stock))
            .duration(1000)
            .attr("d", line);
    }
    
    stockSelect.on("change", function() {
        const selectedStock = this.value;
        updateLine(selectedStock);
    });
    
    const tooltip = d3.select("#tooltip");

function drawMarkers(stock) {
    const stockData = data.filter(d => d.stock === stock);

    svg.selectAll(".marker")
        .data(stockData)
        .enter()
        .append("circle")
        .attr("class", "marker")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.close))
        .attr("r", 4)
        .attr("fill", colorScale(stock))
        .on("mouseover", (event, d) => {
            const tooltipWidth = parseFloat(tooltip.style("width"));
            const tooltipHeight = parseFloat(tooltip.style("height"));
            tooltip.style("opacity", 1)
                .html(`Date: ${d3.timeFormat("%B %d, %Y")(d.date)}<br>
                        Close: $${d.close.toFixed(2)}<br>
                        High: $${d.high.toFixed(2)}<br>
                        Low: $${d.low.toFixed(2)}<br>
                        Volume: ${d.volume.toLocaleString()}`)
                .style("left", (event.pageX - tooltipWidth / 2) + "px") // center tooltip horizontally
                .style("top", (event.pageY + 20) + "px") // add offset and center tooltip vertically
                .style("pointer-events", "none")
                .style("z-index", 9999); // prevent tooltip from blocking mouse events
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });
}
    

function updateMarkers(stock) {
    const stockData = data.filter(d => d.stock === stock);

    const markers = svg.selectAll(".marker")
        .data(stockData);

    markers.enter()
        .append("circle")
        .attr("class", "marker")
        .merge(markers)
        .transition()
        .duration(1000)
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.close))
        .attr("r", 4)
        .attr("fill", colorScale(stock))

    markers.exit().remove();
}

drawMarkers(initialStock);


stockSelect.on("change", function() {
    const selectedStock = this.value;
    updateLine(selectedStock);
    updateMarkers(selectedStock);
});

});
