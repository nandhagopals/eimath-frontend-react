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
} & {
  [key: string]: number;
};

const generateRandomHexColor = (): string => {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
};

const Chart: FC<{
  data: ChartData[];
  width: number;
  containerHeight: number;
  maxValue: number;
}> = ({ data, containerHeight, width, maxValue }) => {
  const keys = Array.from(
    data.reduce((keys, item) => {
      Object.keys(item).forEach((key) => {
        if (key !== "year") {
          keys.add(key);
        }
      });
      return keys;
    }, new Set<string>())
  );

  const yearScale = scaleBand<string>({
    domain: data.map((data) => data?.year?.toString()),
    padding: 0.9,
  });

  const studentsScale = scaleLinear<number>({
    domain: [maxValue > 10 ? maxValue : 10, 0],
    nice: true,
    round: true,
  });

  const colorScale = scaleOrdinal<string, string>({
    domain: keys,
    range: keys?.map(() => generateRandomHexColor()),
  });

  const height = containerHeight - 30;
  const margin = { top: 20, right: 0, bottom: 30, left: 30 };

  yearScale.rangeRound([margin.left, width]);

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
          <BarStack<ChartData, string>
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
                  <Fragment key={`bar-stack-${barStack.index}-${bar.index}`}>
                    <rect
                      x={bar.x}
                      y={bar.y}
                      height={bar.height}
                      width={bar.width}
                      fill={bar.color}
                    />
                    {bar?.height > 15 ? (
                      <text
                        x={bar.x}
                        y={bar.y}
                        dy={bar.height / 2}
                        dx={bar.width / 2}
                        fontSize={10}
                        fill="white"
                        textAnchor="middle"
                      >
                        {bar?.bar?.data?.[bar?.key] ?? ""}
                      </text>
                    ) : null}
                  </Fragment>
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
        className="!space-x-4 max-w-full overflow-x-auto"
      />
    </Fragment>
  );
};

interface Props {
  data: ChartData[];
  maxValue: number;
}
const StackedBarChart: FC<Props> = ({ data, maxValue }) => {
  return (
    <div className="h-[250px] max-h-[250px] mx-[30px] my-8">
      <ParentSize debounceTime={0}>
        {({ width, height }) => {
          return (
            <Chart
              data={data}
              containerHeight={height}
              width={width}
              maxValue={maxValue}
            />
          );
        }}
      </ParentSize>
    </div>
  );
};

export default StackedBarChart;
