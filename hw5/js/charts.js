// HW5 – Argumentative Vis: Federal minimum wage debate
// Both charts read the same Kaggle dataset (data/minimum_wage_data.csv).
// Charts are static SVG: no tooltips, transitions, or event handlers.

const W = 600;
const H = 680;
const COLOR_YES = "#c0392b";
const COLOR_NO = "#23845c";
const GREY = "#c9c6bf";
const INK = "#1d232b";
const MUTED = "#5d6673";

d3.csv("data/minimum_wage_data.csv", d3.autoType).then(rows => {
  drawYes(rows);
  drawNo(rows);
});

/* ------------------------------------------------------------------
   LEFT (YES): real value of the federal minimum wage, 1968–2020
------------------------------------------------------------------- */
function drawYes(rows) {
  // one federal value per year
  const fed = Array.from(
    d3.group(rows, d => d.Year),
    ([year, rs]) => ({ year, real: rs[0]["Federal.Minimum.Wage.2020.Dollars"], nominal: rs[0]["Federal.Minimum.Wage"] })
  ).sort((a, b) => a.year - b.year);

  const peak = d3.greatest(fed, d => d.real);
  const last = fed[fed.length - 1];
  const pctDrop = (peak.real - last.real) / peak.real;
  const yearlyLoss = (peak.real - last.real) * 2080; // 40 hrs x 52 wks

  const m = { top: 40, right: 74, bottom: 44, left: 58 };
  const iw = W - m.left - m.right;
  const ih = H - m.top - m.bottom;

  const svg = d3.select("#chart-yes").append("svg").attr("viewBox", `0 0 ${W} ${H}`);
  const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

  const x = d3.scaleLinear().domain([1968, 2020]).range([0, iw]);
  const y = d3.scaleLinear().domain([6, 11]).range([ih, 0]);

  // gridlines
  g.append("g").attr("class", "grid")
    .call(d3.axisLeft(y).ticks(5).tickSize(-iw).tickFormat(""));

  // "frozen" period since the last raise
  const frozenStart = fed.find(d => d.nominal === last.nominal).year;
  g.append("rect")
    .attr("x", x(frozenStart)).attr("y", 0)
    .attr("width", x(2020) - x(frozenStart)).attr("height", ih)
    .attr("fill", "#f1efea");
  g.append("text")
    .attr("x", (x(frozenStart) + x(2020)) / 2).attr("y", 16)
    .attr("text-anchor", "middle").attr("font-size", 11).attr("font-weight", "bold")
    .attr("fill", MUTED).text("FROZEN AT $7.25");
  g.append("text")
    .attr("x", (x(frozenStart) + x(2020)) / 2).attr("y", 31)
    .attr("text-anchor", "middle").attr("font-size", 11)
    .attr("fill", MUTED).text("since 2009");

  // lost purchasing power since the peak
  const afterPeak = fed.filter(d => d.year >= peak.year);
  g.append("path")
    .datum(afterPeak)
    .attr("fill", COLOR_YES).attr("fill-opacity", 0.16)
    .attr("d", d3.area().x(d => x(d.year)).y0(y(peak.real)).y1(d => y(d.real)).curve(d3.curveMonotoneX));

  // peak reference line
  g.append("line")
    .attr("x1", x(peak.year)).attr("x2", x(2020))
    .attr("y1", y(peak.real)).attr("y2", y(peak.real))
    .attr("stroke", COLOR_YES).attr("stroke-width", 1.5).attr("stroke-dasharray", "5 4");

  // main line
  g.append("path")
    .datum(fed)
    .attr("fill", "none").attr("stroke", COLOR_YES).attr("stroke-width", 3.2)
    .attr("d", d3.line().x(d => x(d.year)).y(d => y(d.real)).curve(d3.curveMonotoneX));

  // peak marker
  g.append("circle").attr("cx", x(peak.year)).attr("cy", y(peak.real)).attr("r", 5.5)
    .attr("fill", "#fff").attr("stroke", COLOR_YES).attr("stroke-width", 3);
  g.append("text")
    .attr("x", x(peak.year)).attr("y", y(peak.real) - 14)
    .attr("text-anchor", "middle").attr("font-size", 13).attr("font-weight", "bold").attr("fill", INK)
    .text(`${peak.year} peak: $${peak.real.toFixed(2)}`);

  // end marker
  g.append("circle").attr("cx", x(last.year)).attr("cy", y(last.real)).attr("r", 5.5)
    .attr("fill", COLOR_YES);
  g.append("text")
    .attr("x", x(last.year) + 9).attr("y", y(last.real) + 4)
    .attr("font-size", 13).attr("font-weight", "bold").attr("fill", COLOR_YES)
    .text(`$${last.real.toFixed(2)}`);

  // drop bracket on the right edge
  const bx = x(2020) + 44;
  g.append("path")
    .attr("d", `M${bx - 6},${y(peak.real)} H${bx} V${y(last.real) - 14}`)
    .attr("fill", "none").attr("stroke", COLOR_YES).attr("stroke-width", 1.5);
  g.append("path")
    .attr("d", `M${bx - 5},${y(last.real) - 22} L${bx},${y(last.real) - 12} L${bx + 5},${y(last.real) - 22}`)
    .attr("fill", "none").attr("stroke", COLOR_YES).attr("stroke-width", 1.5);
  g.append("text")
    .attr("transform", `translate(${bx + 16},${(y(peak.real) + y(last.real)) / 2}) rotate(90)`)
    .attr("text-anchor", "middle").attr("font-size", 22).attr("font-weight", "bold").attr("fill", COLOR_YES)
    .text(`−${Math.round(pctDrop * 100)}%`);

  // callout: what that means per year
  const cx0 = x(1968) + 12, cy0 = y(7.0);
  const callout = g.append("g").attr("transform", `translate(${cx0},${cy0})`);
  callout.append("rect")
    .attr("width", 168).attr("height", 70).attr("rx", 4)
    .attr("fill", "#fff").attr("stroke", COLOR_YES).attr("stroke-width", 1.2);
  callout.append("text").attr("x", 12).attr("y", 28)
    .attr("font-size", 19).attr("font-weight", "bold").attr("fill", COLOR_YES)
    .text(`$${d3.format(",.0f")(yearlyLoss)} less`);
  callout.append("text").attr("x", 12).attr("y", 47)
    .attr("font-size", 11).attr("fill", INK)
    .text(`a year for a full-time worker`);
  callout.append("text").attr("x", 12).attr("y", 61)
    .attr("font-size", 11).attr("fill", INK)
    .text(`vs. ${peak.year} buying power`);

  // axes
  g.append("g").attr("class", "axis").attr("transform", `translate(0,${ih})`)
    .call(d3.axisBottom(x).tickValues([1968, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020]).tickFormat(d3.format("d")));
  g.append("g").attr("class", "axis")
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d}`));
  g.append("text")
    .attr("transform", `translate(${-44},${ih / 2}) rotate(-90)`)
    .attr("text-anchor", "middle").attr("font-size", 12).attr("fill", MUTED)
    .text("Hourly wage in 2020 dollars");
}

/* ------------------------------------------------------------------
   RIGHT (NO): effective minimum wage by state, 2020
------------------------------------------------------------------- */
function drawNo(rows) {
  const territories = new Set(["Guam", "Puerto Rico", "U.S. Virgin Islands"]);
  const data = rows
    .filter(d => d.Year === 2020 && !territories.has(d.State))
    .map(d => ({ state: d.State, wage: d["Effective.Minimum.Wage"], federal: d["Federal.Minimum.Wage"] }))
    .sort((a, b) => d3.descending(a.wage, b.wage) || d3.ascending(a.state, b.state));

  const federal = data[0].federal;
  const above = data.filter(d => d.wage > federal);
  const statesAbove = above.filter(d => d.state !== "District of Columbia").length;
  const atFloor = data.length - above.length;

  const m = { top: 104, right: 46, bottom: 44, left: 132 };
  const iw = W - m.left - m.right;
  const ih = H - m.top - m.bottom;

  const svg = d3.select("#chart-no").append("svg").attr("viewBox", `0 0 ${W} ${H}`);

  // headline callout
  svg.append("text").attr("x", 18).attr("y", 40)
    .attr("font-size", 34).attr("font-weight", "bold").attr("fill", COLOR_NO)
    .text(`${statesAbove} states + D.C.`);
  svg.append("text").attr("x", 18).attr("y", 64)
    .attr("font-size", 14).attr("fill", INK)
    .text("have already raised their minimum wage on their own");

  const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

  const x = d3.scaleLinear().domain([0, 15]).range([0, iw]);
  const y = d3.scaleBand().domain(data.map(d => d.state)).range([0, ih]).padding(0.22);

  g.append("g").attr("class", "grid").attr("transform", `translate(0,${ih})`)
    .call(d3.axisBottom(x).ticks(6).tickSize(-ih).tickFormat(""));

  g.selectAll("rect.bar")
    .data(data).join("rect").attr("class", "bar")
    .attr("x", 0).attr("y", d => y(d.state))
    .attr("width", d => x(d.wage)).attr("height", y.bandwidth())
    .attr("fill", d => d.wage > federal ? COLOR_NO : GREY);

  // state labels
  g.selectAll("text.state")
    .data(data).join("text").attr("class", "state")
    .attr("x", -8).attr("y", d => y(d.state) + y.bandwidth() / 2)
    .attr("dy", "0.35em").attr("text-anchor", "end").attr("font-size", 10)
    .attr("fill", d => d.wage > federal ? INK : MUTED)
    .text(d => d.state === "District of Columbia" ? "Washington, D.C." : d.state);

  // value labels on green bars
  g.selectAll("text.val")
    .data(above).join("text").attr("class", "val")
    .attr("x", d => x(d.wage) + 4).attr("y", d => y(d.state) + y.bandwidth() / 2)
    .attr("dy", "0.35em").attr("font-size", 9.5).attr("fill", COLOR_NO)
    .text(d => `$${d.wage.toFixed(2)}`);

  // federal floor line
  g.append("line")
    .attr("x1", x(federal)).attr("x2", x(federal))
    .attr("y1", -10).attr("y2", ih)
    .attr("stroke", INK).attr("stroke-width", 1.4).attr("stroke-dasharray", "4 3");
  g.append("text")
    .attr("x", x(federal)).attr("y", -16).attr("text-anchor", "middle")
    .attr("font-size", 11).attr("font-weight", "bold").attr("fill", INK)
    .text(`Federal floor $${federal.toFixed(2)}`);

  // note for the grey group
  const firstGrey = data[above.length].state;
  const lastGrey = data[data.length - 1].state;
  const gy0 = y(firstGrey), gy1 = y(lastGrey) + y.bandwidth();
  const nx = x(federal) + 18;
  g.append("path")
    .attr("d", `M${nx},${gy0} h6 V${gy1} h-6`)
    .attr("fill", "none").attr("stroke", MUTED);
  g.append("text").attr("x", nx + 16).attr("y", (gy0 + gy1) / 2 - 8)
    .attr("font-size", 12.5).attr("font-weight", "bold").attr("fill", MUTED)
    .text(`${atFloor} states kept $${federal.toFixed(2)}`);
  g.append("text").attr("x", nx + 16).attr("y", (gy0 + gy1) / 2 + 9)
    .attr("font-size", 11.5).attr("fill", MUTED)
    .text("their voters' choice to make");

  // axis
  g.append("g").attr("class", "axis").attr("transform", `translate(0,${ih})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d => `$${d}`));
  g.append("text")
    .attr("x", iw / 2).attr("y", ih + 36).attr("text-anchor", "middle")
    .attr("font-size", 12).attr("fill", MUTED)
    .text("Minimum wage per hour (Jan 1, 2020)");
}
