let displayByQuarter = false;

d3.csv("dow_jones_index.csv").then(data => {
    data.forEach(d => {
        d.date = d3.timeParse("%m/%d/%Y")(d.date);
        d.open = parseFloat(d.open.slice(1));
        d.high = parseFloat(d.high.slice(1));
        d.low = parseFloat(d.low.slice(1));
        d.close = parseFloat(d.close.slice(1));
        d.volume = +d.volume;
        d.quarter = parseInt(d.quarter);
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

    d3.select("#toggle").on("click", () => {
        displayByQuarter = !displayByQuarter;
        updateChart();
    });
    function updateChart() {
        const svg = d3.select("#chart");
        svg.selectAll("*").remove();
        if (!displayByQuarter) {
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
    
        function drawLine(stock) {
            const stockData = data.filter(d => d.stock === stock);
        
            svg.append("path")
                .datum(stockData)
                .attr("class", "line")
                .attr("d", line)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2);
        }
        function updateYscale(stock) {
            const stockData = data.filter(d => d.stock === stock);
        
            yScale.domain([d3.min(stockData, d => d.close), d3.max(stockData, d => d.close)]);
            svg.select(".y-axis").call(d3.axisLeft(yScale));

            
            
        }
        
        
        const initialStock = stocks[0];
        updateYscale(initialStock);
        drawLine(initialStock);
    
        function updateLine(stock) {
            const stockData = data.filter(d => d.stock === stock);
        
            svg.selectAll(".line")
                .datum(stockData)
                .transition()
                .duration(1000)
                .attr("d", line);
        }
        
        stockSelect.on("change", function() {
            const selectedStock = this.value;
            updateYscale(selectedStock);
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
            .attr("fill", "steelblue")
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1)
                    .html(`Date: ${d3.timeFormat("%B %d, %Y")(d.date)}<br>
                           Close: $${d.close.toFixed(2)}<br>
                           High: $${d.high.toFixed(2)}<br>
                           Low: $${d.low.toFixed(2)}<br>
                           Volume: ${d.volume.toLocaleString()}`)
                    .style("left", (event.pageX + 20) + "px")
                    .style("top", (event.pageY - 20) + "px");
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
            .attr("fill", "steelblue");
    
        markers.exit().remove();
    }
    
    drawMarkers(initialStock);
    
    
    stockSelect.on("change", function() {
        const selectedStock = this.value;
        updateYscale(selectedStock);    
        updateLine(selectedStock);
        updateMarkers(selectedStock);

    });
        }
    else {
        const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.quarter))
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.close)])
        .range([height, 0]);
    
    const xAxis = d3.axisBottom(xScale)
        .ticks(1)
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
    .x(d => xScale(d.quarter))
    .y(d => yScale(d.close))
    .curve(d3.curveMonotoneX);

    function updateYscale(stock) {
        const stockData = data.filter(d => d.stock === stock);
    
        yScale.domain([d3.min(stockData, d => d.close), d3.max(stockData, d => d.close)]);
        svg.select(".y-axis").call(d3.axisLeft(yScale));    
        
    }
    function drawLine(stock) {
        const stockData = data.filter(d => d.stock === stock);
    
        svg.append("path")
            .datum(stockData)
            .attr("class", "line")
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2);
    }
    
    const initialStock = stocks[0];
    updateYscale(initialStock);
    drawLine(initialStock);
   
    function updateLine(stock) {
        const stockData = data.filter(d => d.stock === stock);
    
        svg.selectAll(".line")
            .datum(stockData)
            .transition()
            .duration(1000)
            .attr("d", line);
    }
    
    stockSelect.on("change", function() {
        const selectedStock = this.value;
        updateYscale(selectedStock);
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
        .attr("cx", d => xScale(d.quarter))
        .attr("cy", d => yScale(d.close))
        .attr("r", 4)
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`Date: ${d3.timeFormat("%B %d, %Y")(d.quarter)}<br>
                       Close: $${d.close.toFixed(2)}<br>
                       High: $${d.high.toFixed(2)}<br>
                       Low: $${d.low.toFixed(2)}<br>
                       Volume: ${d.volume.toLocaleString()}`)
                .style("left", (event.pageX + 20) + "px")
                .style("top", (event.pageY - 20) + "px");
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
        .attr("cx", d => xScale(d.quarter))
        .attr("cy", d => yScale(d.close))
        .attr("r", 4)
        .attr("fill", "steelblue");

    markers.exit().remove();
}

drawMarkers(initialStock);


stockSelect.on("change", function() {
    const selectedStock = this.value;
    updateYscale(selectedStock);
    updateLine(selectedStock);
    updateMarkers(selectedStock);
});
    }
    }


});
