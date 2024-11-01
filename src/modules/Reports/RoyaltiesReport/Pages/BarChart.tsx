import { FC, Fragment, useMemo } from "react";
import { scaleBand, scaleLinear } from "@visx/scale";
import { GridRows, GridColumns } from "@visx/grid";
import { ParentSize } from "@visx/responsive";
import { AxisBottom } from "@visx/axis";
import { Group } from "@visx/group";
import { Bar } from "@visx/shape";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { useSpring, animated } from "@react-spring/web";

type BarChart = { year: number; amount: number };

type TooltipData = {
  bar: BarChart;
  index: number;
  height: number;
  width: number;
  x: number;
  y: number;
};

const tooltipStyles = {
  ...defaultStyles,
  padding: "4px 8px",
  backgroundColor: "#FFE9DC",
  color: "#FF5F00",
};

const defaultMargin = { top: 30, right: 0, bottom: 30, left: 0 };

const Chart: FC<{
  data: BarChart[];
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}> = ({ data, height, width, margin = defaultMargin }) => {
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip<TooltipData>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  let tooltipTimeout: number;

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.bottom;

  const xScale = useMemo(
    () =>
      scaleBand({
        range: [0, xMax],
        round: true,
        domain: data.map((d) => d.year),
        padding: 0.9,
      }),
    [data, xMax]
  );
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...data.map((d) => d.amount))],
      }),
    [data, yMax]
  );

  const { scale } = useSpring({
    from: { scale: 0 },
    to: { scale: 1 },
  });
  const AnimatedBar = animated(Bar);

  return (
    <Fragment>
      <svg ref={containerRef} width={width} height={height}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height - 30}
          stroke="#BDBDBD"
          fill="transparent"
          strokeDasharray={"1,2"}
          rx={5}
        />
        <GridRows
          height={height}
          width={width}
          scale={yScale}
          stroke="#BDBDBD"
          strokeDasharray="0.6"
        />
        <GridColumns
          height={height - 30}
          width={width}
          scale={xScale}
          stroke="#BDBDBD"
          strokeDasharray="0.6"
          allowReorder="no"
        />
        <Group top={margin.bottom}>
          {data?.map(({ amount, year }, index) => {
            const barWidth = xScale.bandwidth();
            const barHeight = yMax - (yScale(amount) ?? 0);
            const barX = xScale(year);
            const barY = yMax - barHeight - margin.bottom;
            return (
              <AnimatedBar
                key={`bar-${year}`}
                x={barX}
                y={scale.to((s) => yMax - s * barHeight - margin.bottom)}
                width={barWidth}
                height={scale.to((s) => s * barHeight)}
                fill="#FF5F00"
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
                      bar: { amount, year },
                      height: barHeight,
                      index,
                      width: barWidth,
                      x: barX ?? 0,
                      y: barY,
                    },
                    tooltipTop: eventSvgCoords?.y,
                    tooltipLeft: eventSvgCoords?.x,
                  });
                }}
              />
            );
          })}
        </Group>
        <AxisBottom
          top={yMax}
          scale={xScale}
          tickLabelProps={{
            fill: "#4F4F4F",
            fontSize: 11,
            textAnchor: "middle",
          }}
          hideAxisLine
          hideTicks
        />
      </svg>{" "}
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
          className="relative"
          offsetLeft={-25}
          offsetTop={-30}
        >
          <p className="text-[10px] text-center">{tooltipData?.bar?.amount}</p>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[#FFE9DC]"></div>
        </TooltipInPortal>
      )}
    </Fragment>
  );
};

interface Props {
  data: BarChart[];
}
const BarChart: FC<Props> = ({ data }) => {
  return (
    <div className="h-[200px] max-h-[200px] mx-[30px] my-8">
      <ParentSize debounceTime={0}>
        {({ width, height }) => {
          return <Chart data={data} height={height} width={width} />;
        }}
      </ParentSize>
    </div>
  );
};

export default BarChart;
