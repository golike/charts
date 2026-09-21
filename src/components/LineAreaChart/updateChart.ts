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

  const xRange = [padding[3], width - padding[1]];
  const yRange = [height - padding[2], padding[0]];

  const x = scaleLinear(xExtent, xRange);
  const y = scaleLinear(yExtent, yRange).nice();

  const areaPath = area<StackedData[number]["data"][number]>()
    .defined((d) => d.y !== null && !Number.isNaN(d.y))
    .x((d) => x(d.x))
    .y0((d) => y(isStacked ? d.y0 : 0))
    .y1((d) => y(isStacked ? d.y1 : (d.y ?? 0)))
    .curve(curveMonotoneX);

  const linePath = line<StackedData[number]["data"][number]>()
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

  svg
    .select(`.${classes.areas}`)
    .selectAll("path")
    .data(stackedData.toReversed())
    .join("path")
    .transition()
    .duration(transitionDuration)
    .style("opacity", () => (isStacked ? 0.75 : 0))
    .transition()
    .duration(transitionDuration)
    .attr("d", (d) => areaPath(d.data))
    .style("fill", (datum, d) => color(d));

  svg
    .select(`.${classes.lines}`)
    .selectAll("path")
    .data(stackedData.toReversed())
    .join("path")
    .transition()
    .delay(transitionDuration)
    .duration(transitionDuration)
    .attr("d", (d) => linePath(d.data))
    .style("stroke", (datum, d) => color(d));

  svg
    .select<SVGGElement>(`.${classes["x-axis"]}`)
    .attr("transform", `translate(0,${padding[0]})`)
    .transition()
    .delay(transitionDuration)
    .duration(transitionDuration)
    .call(axisBottom(x).tickSize(height - padding[2] - padding[0]));

  svg
    .select<SVGGElement>(`.${classes["y-axis"]}`)
    .attr("transform", `translate(${padding[3]},0)`)
    .transition()
    .delay(transitionDuration)
    .duration(transitionDuration)
    .call(
      axisRight(y)
        .ticks(5)
        .tickSize(width - padding[3] - padding[1]),
    );
};
