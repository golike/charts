import clsx from "clsx";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classes from "./LineAreaChart.module.css";
import { stackData } from "./utils";
import { updateChart } from "./updateChart";

const defaultPadding = [4, 4, 4, 4];

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

  const stackedData = useMemo(
    () => stackData(data, xAccessor, yAccessor, zAccessor),
    [data, xAccessor, yAccessor, zAccessor],
  );

  const updateSize = useCallback(() => {
    setWidth(ref.current?.clientWidth ?? 0);
    setHeight(ref.current?.clientHeight ?? 0);
  }, [ref]);

  useEffect(updateSize, [ref, updateSize]);

  useLayoutEffect(() => {
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [updateSize]);

  const className = useMemo(
    () => clsx([classes.root, propsClassName]),
    [propsClassName],
  );

  useEffect(() => {
    updateChart(ref, stackedData, isStacked, padding, width, height, 0);

    // update the chart without transitions when layout changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, padding, width]);

  useEffect(() => {
    updateChart(ref, stackedData, isStacked, padding, width, height, 500);

    // update the chart with transitions when data or stacked state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStacked, stackedData]);

  return (
    <svg
      ref={ref}
      className={className}
      onMouseMove={(event) => console.log(event.clientX, event.clientY)}
    >
      <g className={classes["x-axis"]} />
      <g className={classes["y-axis"]} />
      <g className={classes.lines} />
      <g className={classes.areas} />
      <g className={classes.serieses} />
      <g className={classes.border} />
    </svg>
  );
};
