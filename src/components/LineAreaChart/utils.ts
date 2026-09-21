import { sum } from "d3";

export type StackedData = {
  name: string;
  data: {
    x: number;
    y: number | null;
    y0: number;
    y1: number;
  }[];
}[];

export const stackData = <T>(
  data: T[],
  xAccessor: (datum: T) => number,
  yAccessor: (datum: T) => number,
  zAccessor: (datum: T) => string,
): StackedData => {
  const xValues = [...new Set(data.map(xAccessor))].sort((a, b) => a - b);
  const zValues = [...new Set(data.map(zAccessor))].sort((a, b) =>
    a.localeCompare(b),
  );

  const o: Record<string, Record<string, number>> = {};
  data.forEach((datum) => {
    const xValue = String(xAccessor(datum));
    const yValue = yAccessor(datum);
    const zValue = zAccessor(datum);

    if (o[zValue] === undefined) o[zValue] = {};
    o[zValue][xValue] = yValue;
  });

  const serieses: StackedData = zValues.map((z) => {
    return {
      name: z,
      data: xValues.map((x) => {
        const y = o[z][x] ?? null;
        return {
          x,
          y,
          y0: 0,
          y1: y,
        };
      }),
    };
  });

  serieses.forEach((series, s) => {
    const prevSerieses = serieses.filter((series, s1) => s1 < s);

    series.data.forEach((datum, d) => {
      const baseline = sum(prevSerieses, (series) => series.data[d].y);
      datum.y0 = baseline;
      datum.y1 = baseline + (datum.y ?? 0);
    });
  });

  return serieses;
};

export const colors = ["red", "orange", "green", "blue", "purple"];
