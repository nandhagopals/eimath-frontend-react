import { FC, Fragment } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear, scaleBand, scaleOrdinal } from "@visx/scale";
import { GridRows, GridColumns } from "@visx/grid";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { LegendOrdinal } from "@visx/legend";
import { Group } from "@visx/group";
import { BarStack } from "@visx/shape";

type ChartData = {
  year: number;
  ["New Student"]: number;
  Discontinued: number;
  // Active: number;
  Graduated: number;
};

type Keys = "New Student" | "Discontinued" | "Graduated";

const Chart: FC<{
  data: ChartData[];
  width: number;
  containerHeight: number;
}> = ({ data, containerHeight, width }) => {
  const keys = Object.keys(data[0]).filter((d) => d !== "year") as Keys[];

  const yearScale = scaleBand<string>({
    domain: data.map((data) => data?.year?.toString()),
    padding: 0.8,
  });

  const getMaxValue = () => {
    const maxValues: {
      // Active: number;
      Discontinued: number;
      Graduated: number;
      NewStudent: number;
    } = {
      // Active: 0,
      Discontinued: 0,
      Graduated: 0,
      NewStudent: 0,
    };

    for (const item of data) {
      const {
        // Active,
        Discontinued,
        Graduated,
        ["New Student"]: NewStudent,
      } = item;

      // maxValues.Active = Math.max(maxValues.Active || 0, Active);
      maxValues.Discontinued = Math.max(
        maxValues.Discontinued || 0,
        Discontinued
      );
      maxValues.Graduated = Math.max(maxValues.Graduated || 0, Graduated);
      maxValues.NewStudent = Math.max(maxValues.NewStudent || 0, NewStudent);
    }

    return Math.max(
      ...[
        // maxValues.Active,
        maxValues.Discontinued,
        maxValues.Graduated,
        maxValues.NewStudent,
      ]
    );
  };

  const studentsScale = scaleLinear<number>({
    domain: [getMaxValue() + getMaxValue(), 0],
    nice: true,
  });

  const colorScale = scaleOrdinal<Keys, string>({
    domain: ["New Student", "Discontinued", "Graduated"],
    range: ["#2D9CDB", "#F94144", "#90BE6D"],
  });

  const height = containerHeight - 30;

  const margin = { top: 20, right: 0, bottom: 30, left: 30 };

  yearScale.rangeRound([0, width]);

  studentsScale.rangeRound([0, height - margin.bottom - margin.top]);

  return (
    <Fragment>
      <svg width={width} height={height}>
        <rect
          x={margin.left}
          y={margin.top}
          width={width - margin.left}
          height={height - margin.bottom - margin.top}
          stroke="#BDBDBD"
          fill="transparent"
          strokeDasharray={"1,2"}
          rx={2}
        />
        <g transform={`translate(${margin.left},${margin.top})`}>
          <GridColumns
            width={width}
            height={height - margin.bottom - margin.top}
            scale={yearScale}
            stroke={"#BDBDBD"}
            strokeDasharray={"0.7"}
          />
          <GridRows
            height={height - margin.bottom - margin.top}
            width={width - margin.left}
            scale={studentsScale}
            stroke={"#BDBDBD"}
            strokeDasharray={"0.7"}
          />
        </g>
        <Group top={margin.top} left={margin.left}>
          <BarStack<ChartData, Keys>
            data={data}
            keys={keys}
            x={({ year }) => year.toString()}
            xScale={yearScale}
            yScale={studentsScale}
            color={colorScale}
          >
            {(barStacks) =>
              barStacks.map((barStack) =>
                barStack.bars.map((bar) => (
                  <rect
                    key={`bar-stack-${barStack.index}-${bar.index}`}
                    x={bar.x}
                    y={bar.y}
                    height={bar.height}
                    width={bar.width}
                    fill={bar.color}
                  />
                ))
              )
            }
          </BarStack>
        </Group>
        <AxisBottom
          scale={yearScale}
          hideTicks
          hideAxisLine
          left={margin.left}
          top={height - margin.bottom}
        />
        <AxisLeft
          scale={studentsScale}
          hideTicks
          hideAxisLine
          left={margin.left}
          top={margin.top}
        />
      </svg>
      <LegendOrdinal
        scale={colorScale}
        direction="row"
        shape={"circle"}
        shapeHeight={9}
        shapeWidth={9}
        labelFlex={10}
        legendLabelProps={{
          className: "text-[12px] text-[#121212] font-normal",
        }}
        shapeMargin={"1px 12px 0 0"}
        className="!space-x-4"
      />
    </Fragment>
  );
};

interface Props {
  data: ChartData[];
}

const StackedBarChart: FC<Props> = ({ data }) => {
  return (
    <div className="h-[250px] max-h-[250px] mx-[30px] my-8">
      <ParentSize debounceTime={0}>
        {({ width, height }) => {
          return <Chart data={data} containerHeight={height} width={width} />;
        }}
      </ParentSize>
    </div>
  );
};

export default StackedBarChart;
