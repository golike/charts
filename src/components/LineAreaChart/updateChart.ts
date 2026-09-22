import { RefObject } from "react";
import {
  area,
  axisBottom,
  axisRight,
  curveMonotoneX,
  extent,
  line,
  max,
  min,
  scaleLinear,
  scaleOrdinal,
  schemeObservable10,
  select,
} from "d3";
import { type StackedData } from "./utils";
import classes from "./LineAreaChart.module.css";

const color = scaleOrdinal<number, string>(schemeObservable10);

export const updateChart = (
  ref: RefObject<SVGSVGElement | null>,
  stackedData: StackedData,
  isStacked: boolean,
  padding: number[],
  width: number,
  height: number,
  transitionDuration: number = 0,
) => {
  if (width === 0 || height === 0) return;

  const xExtent = extent(stackedData[0].data, (d) => d.x);

  if (xExtent[0] === undefined || xExtent[1] === undefined) return;

  const yMin = min(stackedData, (series) =>
    min(series.data, (d) => (isStacked ? d.y0 : d.y)),
  );

  const yMax = max(stackedData, (series) =>
    max(series.data, (d) => (isStacked ? d.y1 : d.y)),
  );

  const yExtent: [undefined, undefined] | [number, number] =
    yMin !== undefined && yMax !== undefined
      ? [yMin, yMax]
      : [undefined, undefined];

  if (yExtent[0] === undefined || yExtent[1] === undefined) return;

  const verticalPadding = yExtent[1] * 0.01;

  yExtent[0] = isStacked ? 0 : -verticalPadding;
  yExtent[1] = yExtent[1] + verticalPadding;

  const xRange = [padding[3], width - padding[1]];
  const yRange = [height - padding[2], padding[0]];

  const x = scaleLinear(xExtent, xRange);
  const y = scaleLinear(yExtent, yRange).nice();

  const getAreaPath = area<StackedData[number]["data"][number]>()
    .defined((d) => d.y !== null && !Number.isNaN(d.y))
    .x((d) => x(d.x))
    .y0((d) => y(isStacked ? d.y0 : 0))
    .y1((d) => y(isStacked ? d.y1 : (d.y ?? 0)))
    .curve(curveMonotoneX);

  const getLinePath = line<StackedData[number]["data"][number]>()
    .x((d) => x(d.x))
    .y((d) => y(isStacked ? d.y1 : (d.y ?? 0)))
    .curve(curveMonotoneX);

  const svg = select(ref.current);

  svg
    .select(`.${classes.border}`)
    .selectAll("rect")
    .data([0])
    .join("rect")
    .transition()
    .delay(transitionDuration)
    .duration(transitionDuration)
    .attr("x", padding[3])
    .attr("y", padding[0])
    .attr("width", width - padding[1] - padding[3])
    .attr("height", height - padding[2] - padding[0]);

  let series = svg
    .select(`.${classes.serieses}`)
    .selectAll<SVGGElement, StackedData[number]>("g")
    .data(stackedData.toReversed());

  const seriesExit = series.exit();

  const seriesEnter = series.enter().append("g");

  let areaPath = series.select<SVGPathElement>(`path.${classes.area}`);
  let linePath = series.select<SVGPathElement>(`path.${classes.line}`);

  series = series.merge(seriesEnter);

  areaPath = areaPath.merge(
    seriesEnter
      .append("path")
      .attr("class", classes.area)
      .style("fill", (datum, d) => color(d)),
  );

  if (isStacked) {
    areaPath
      .transition()
      .duration(transitionDuration)
      .attr("d", (d) => getAreaPath(d.data))
      .transition()
      .duration(transitionDuration)
      .style("opacity", () => (isStacked ? 0.75 : 0));
  } else {
    areaPath
      .transition()
      .duration(transitionDuration)
      .style("opacity", () => (isStacked ? 0.75 : 0))
      .transition()
      .duration(transitionDuration)
      .attr("d", (d) => getAreaPath(d.data));
  }

  linePath = linePath.merge(
    seriesEnter
      .append("path")
      .attr("class", classes.line)
      .attr("d", (d) => getLinePath(d.data))
      .style("stroke", (datum, d) => color(d)),
  );

  linePath
    .transition()
    .delay(isStacked ? 0 : transitionDuration)
    .duration(transitionDuration)
    .attr("d", (d) => getLinePath(d.data))
    .style("stroke", (datum, d) => color(d));

  seriesExit.remove();

  svg
    .select<SVGGElement>(`.${classes["x-axis"]}`)
    .attr("transform", `translate(0,${padding[0]})`)
    .transition()
    .delay(isStacked ? 0 : transitionDuration)
    .duration(transitionDuration)
    .call(axisBottom(x).tickSize(height - padding[2] - padding[0]));

  svg
    .select<SVGGElement>(`.${classes["y-axis"]}`)
    .attr("transform", `translate(${padding[3]},0)`)
    .transition()
    .delay(isStacked ? 0 : transitionDuration)
    .duration(transitionDuration)
    .call(
      axisRight(y)
        .ticks(5)
        .tickSize(width - padding[3] - padding[1]),
    );
};
