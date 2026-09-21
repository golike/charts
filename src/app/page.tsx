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

const padding = [4, 64, 24, 4];

export default function Home() {
  const [isStacked, setIsStacked] = useState(false);
  return (
    <div className={classes.root}>
      <h1>Charts</h1>
      <h5>Line Area</h5>
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
