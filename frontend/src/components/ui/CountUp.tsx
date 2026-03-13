import CountUpLib from "react-countup";
import { useInView } from "react-intersection-observer";

interface CountUpProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

export function CountUp({
  end,
  suffix = "",
  prefix = "",
  duration = 2,
  decimals = 0,
  className = "",
}: CountUpProps) {
  const [ref, inView] = useInView({ triggerOnce: true });

  return (
    <span ref={ref} className={className}>
      {inView ? (
        <CountUpLib
          end={end}
          duration={duration}
          suffix={suffix}
          prefix={prefix}
          decimals={decimals}
          separator=","
        />
      ) : (
        `${prefix}0${suffix}`
      )}
    </span>
  );
}
