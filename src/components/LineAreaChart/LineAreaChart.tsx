import clsx from "clsx";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import classes from "./LineAreaChart.module.css";
import { stackData } from "./utils";
import { updateChart } from "./updateChart";

const defaultPadding = [0, 0, 0, 0];

export const LineAreaChart = <T,>({
  data = [],
  xAccessor,
  yAccessor,
  zAccessor,
  padding = defaultPadding,
  isStacked = false,
  className: propsClassName,
}: {
  data: T[];
  xAccessor: (datum: T) => number;
  yAccessor: (datum: T) => number;
  zAccessor: (datum: T) => string;
  padding?: number[];
  isStacked?: boolean;
  className?: string;
}) => {
  const ref = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const stackedData = useMemo(() => {
    const stackedData = stackData(data, xAccessor, yAccessor, zAccessor);

    return stackedData;
  }, [data, xAccessor, yAccessor, zAccessor]);

  const updateSize = () => {
    setWidth(ref.current?.clientWidth ?? 0);
    setHeight(ref.current?.clientHeight ?? 0);
  };

  useEffect(updateSize, [ref]);

  useLayoutEffect(() => {
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const className = useMemo(
    () => clsx([classes.root, propsClassName]),
    [propsClassName],
  );

  useEffect(() => {
    updateChart(ref, stackedData, isStacked, padding, width, height, 0);
  }, [height, padding, width]);

  useEffect(() => {
    updateChart(ref, stackedData, isStacked, padding, width, height, 500);
  }, [isStacked, stackedData]);

  return (
    <svg ref={ref} className={className}>
      <g className={classes["x-axis"]} />
      <g className={classes["y-axis"]} />
      <g className={classes.lines} />
      <g className={classes.areas} />
      <g className={classes.border} />
    </svg>
  );
};
