"use client";

import { LineAreaChart } from "@/components/LineAreaChart/LineAreaChart";
import classes from "./page.module.css";
import { range } from "d3";
import { useState } from "react";

const data: {
  x: number;
  y: number;
  z: string;
}[] = [];

range(4).forEach((s) => {
  range(32).forEach((d) => {
    const y = Math.round(Math.random() * 1000);

    data.push({
      x: d,
      y,
      z: `Series ${s + 1}`,
    });
  });
});

const padding = [4, 32, 16, 4];

export default function Home() {
  const [isStacked, setIsStacked] = useState(true);

  return (
    <div className={classes.root}>
      <h1>Charts</h1>
      <h3>Line Area</h3>
      <p>
        This combo chart has built in transitions between stacked and unstacked.
        It assumes no negative values in the stacked direction and continuous
        numerical data in the other.
      </p>
      <button onClick={() => setIsStacked(!isStacked)}>
        {isStacked ? "Unstack" : "Stack"}
      </button>
      <LineAreaChart
        data={data}
        xAccessor={(d) => d.x}
        yAccessor={(d) => d.y}
        zAccessor={(d) => d.z}
        padding={padding}
        isStacked={isStacked}
        className={classes.chart}
      />
    </div>
  );
}
