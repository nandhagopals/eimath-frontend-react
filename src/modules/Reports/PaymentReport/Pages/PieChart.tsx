import { FC, Fragment, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { Group } from "@visx/group";
import Pie, { ProvidedProps, PieArcDatum } from "@visx/shape/lib/shapes/Pie";
import { animated, useTransition, to } from "@react-spring/web";
import { scaleOrdinal } from "@visx/scale";
import { LegendOrdinal } from "@visx/legend";

type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };

const fromLeaveTransition = ({ endAngle }: PieArcDatum<any>) => ({
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
});
const enterUpdateTransition = ({ startAngle, endAngle }: PieArcDatum<any>) => ({
  startAngle,
  endAngle,
  opacity: 1,
});

type AnimatedPieProps<Datum> = ProvidedProps<Datum> & {
  animate?: boolean;
  getKey: (d: PieArcDatum<Datum>) => string;
  getColor: (d: PieArcDatum<Datum>) => string;
  onClickDatum: (d: PieArcDatum<Datum>) => void;
  delay?: number;
};

function AnimatedPie<Datum>({
  animate,
  arcs,
  path,
  getKey,
  getColor,
  onClickDatum,
}: AnimatedPieProps<Datum>) {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  });
  return transitions((props, arc, { key }) => {
    const [centroidX, centroidY] = path.centroid(arc);
    const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;

    return (
      <g key={key}>
        <animated.path
          d={to([props.startAngle, props.endAngle], (startAngle, endAngle) =>
            path({
              ...arc,
              startAngle,
              endAngle,
            })
          )}
          fill={getColor(arc)}
          onClick={() => onClickDatum(arc)}
          onTouchStart={() => onClickDatum(arc)}
          className={"cursor-pointer"}
        />
        {hasSpaceForLabel && (
          <animated.g style={{ opacity: props.opacity }}>
            <text
              fill="white"
              x={centroidX}
              y={centroidY}
              dy=".33em"
              fontSize={9}
              textAnchor="middle"
              pointerEvents="none"
            >
              {getKey(arc)}
            </text>
          </animated.g>
        )}
      </g>
    );
  });
}

type ChartData = { status: "Paid" | "Unpaid"; value: number };

const Chart: FC<{
  data: ChartData[];
  width: number;
  containerHeight: number;
}> = ({ data, containerHeight, width }) => {
  const getLetterFrequencyColor = scaleOrdinal({
    domain: data.map((l) => l.status),
    range: ["#2E7D6F", "#C62828"],
  });
  const height = containerHeight - 40;
  const [selectedAlphabetLetter, setSelectedAlphabetLetter] = useState<
    string | null
  >(null);

  if (width < 10) return null;

  const innerWidth = width;
  const innerHeight = height;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  return (
    <Fragment>
      <svg width={width} height={height}>
        <Group top={centerY} left={centerX}>
          <Pie
            data={
              selectedAlphabetLetter
                ? data.filter(({ status }) => status === selectedAlphabetLetter)
                : data
            }
            pieValue={({ value }) => value}
            pieSortValues={() => -1}
            outerRadius={radius}
          >
            {(pie) => (
              <AnimatedPie
                {...pie}
                animate
                getKey={({ data: { status } }) => status}
                onClickDatum={({ data: { status } }) =>
                  setSelectedAlphabetLetter(
                    selectedAlphabetLetter === status ? null : status
                  )
                }
                getColor={({ data: { status } }) =>
                  getLetterFrequencyColor(status)
                }
              />
            )}
          </Pie>
        </Group>
      </svg>

      <LegendOrdinal
        scale={getLetterFrequencyColor}
        direction="row"
        shape={"circle"}
        shapeHeight={9}
        shapeWidth={9}
        labelFlex={10}
        legendLabelProps={{
          className: "text-[12px] text-[#121212] font-normal",
        }}
        shapeMargin={"1px 12px 0 0"}
        className="!space-x-4 ml-5 mt-2"
      />
    </Fragment>
  );
};

interface Props {
  data: ChartData[];
}

const PieChart: FC<Props> = ({ data }) => {
  return (
    <div className="w-80 h-[250px] max-h-[250px] my-[32px]">
      <ParentSize debounceTime={0}>
        {({ width, height }) => {
          return <Chart data={data} containerHeight={height} width={width} />;
        }}
      </ParentSize>
    </div>
  );
};

export default PieChart;
