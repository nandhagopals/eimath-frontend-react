import { FC, Fragment } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { Group } from "@visx/group";
import { BarGroup } from "@visx/shape";
import { AxisBottom } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { LegendOrdinal } from "@visx/legend";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { useSpring, animated } from "@react-spring/web";

type BarChart = {
  month:
    | "JAN"
    | "FEB"
    | "MAR"
    | "APR"
    | "MAY"
    | "JUN"
    | "JUL"
    | "AUG"
    | "SEP"
    | "OCT"
    | "NOV"
    | "DEC";
  currentYear: number;
  pastYear: number;
};

type TooltipData = {
  bar: {
    key: "currentYear" | "pastYear";
    value: number;
  };
  index: number;
  height: number;
  width: number;
  x: number;
  y: number;
};

const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: "#FFE9DC",
  color: "#FF5F00",
};

let tooltipTimeout: number;
const Chart: FC<{
  data: BarChart[];
  width: number;
  height: number;
  currency: string | null;
}> = ({ data, height, width, currency }) => {
  const keys = Object.keys(data[0]).filter((d) => d !== "month") as (
    | "currentYear"
    | "pastYear"
  )[];

  const monthScale = scaleBand<string>({
    domain: data.map((d) => d.month),
  });

  const keyScale = scaleBand<string>({
    domain: keys,
    padding: 0.4,
  });

  const colorScale = scaleOrdinal<string, string>({
    domain: ["Current Year", "Past Year"],
    range: ["#FF5F00", "#015B9D"],
  });
  const maxAmount = Math.max(
    ...data.map((d) => Math.max(...keys.map((key) => d[key])))
  );

  const currentAndPastYearScale = scaleLinear<number>({
    domain: [0, maxAmount > 0 ? maxAmount : 50],
  });

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  const margin = { top: 30, right: 0, bottom: 30, left: 0 };

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // update scale output dimensions
  monthScale.rangeRound([0, xMax]);
  keyScale.rangeRound([0, monthScale.bandwidth()]);
  currentAndPastYearScale.range([yMax, 0]);

  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip<TooltipData>();

  const { scale } = useSpring({
    from: { scale: 0 },
    to: { scale: 1 },
  });

  return (
    <Fragment>
      <svg ref={containerRef} width={width} height={height}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={"transparent"}
          rx={14}
        />
        <GridRows
          height={height - 30}
          width={width}
          scale={currentAndPastYearScale}
          stroke="#015B9D"
          strokeDasharray="0.2"
        />
        <Group top={margin.top} left={margin.left}>
          <BarGroup<BarChart>
            data={data}
            keys={keys}
            height={yMax}
            x0={({ month }) => month}
            x0Scale={monthScale}
            x1Scale={keyScale}
            yScale={currentAndPastYearScale}
            color={(key) => {
              return key === "currentYear" ? "#FF5F00" : "#015B9D";
            }}
          >
            {(barGroups) =>
              barGroups.map((barGroup) => (
                <Group
                  key={`bar-group-${barGroup.index}-${barGroup.x0}`}
                  left={barGroup.x0}
                >
                  {barGroup.bars.map((bar) => (
                    <animated.rect
                      key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                      x={bar.x}
                      y={scale.to((s) => yMax - s * bar.height)}
                      width={bar.width}
                      height={scale.to((s) => s * bar.height)}
                      fill={bar.color}
                      rx={0.4}
                      onMouseLeave={() => {
                        tooltipTimeout = window.setTimeout(() => {
                          hideTooltip();
                        }, 300);
                      }}
                      onMouseMove={(event) => {
                        if (tooltipTimeout) clearTimeout(tooltipTimeout);

                        const eventSvgCoords = localPoint(event);

                        showTooltip({
                          tooltipData: {
                            bar: {
                              key: bar?.key as unknown as any,
                              value: bar?.value as unknown as number,
                            },
                            height: bar?.height,
                            index: bar?.index,
                            width: bar?.width,
                            x: bar?.x,
                            y: bar?.y,
                          },
                          tooltipTop: eventSvgCoords?.y,
                          tooltipLeft: eventSvgCoords?.x,
                        });
                      }}
                    />
                  ))}
                </Group>
              ))
            }
          </BarGroup>
        </Group>
        <AxisBottom
          top={yMax + margin.top}
          scale={monthScale}
          stroke={"#015B9D"}
          hideTicks
          tickLabelProps={{
            fill: "#381500",
            fontSize: 10,
            textAnchor: "middle",
          }}
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
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
          className="relative"
          offsetLeft={-25}
          offsetTop={-30}
        >
          <p className="text-[10px] text-center">
            {currency ?? ""} {tooltipData?.bar?.value}
          </p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[#FFE9DC]" />
        </TooltipInPortal>
      )}
    </Fragment>
  );
};

interface Props {
  data: BarChart[];
  currency: string | null;
}

const DashboardBarChart: FC<Props> = ({ data, currency }) => {
  return (
    <div className="h-[250px] max-h-[250px] m-6 min-w-[1000px]">
      <ParentSize debounceTime={0}>
        {({ width, height }) => {
          return (
            <Chart
              data={data}
              height={height}
              width={width}
              currency={currency}
            />
          );
        }}
      </ParentSize>
    </div>
  );
};
export type { BarChart };
export default DashboardBarChart;
