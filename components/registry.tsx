import { ReactNode } from "react";
import { motion } from "framer-motion";
import katex from "katex";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { QuizComponent } from "./ui/QuizComponent";
import { CalculatorUI } from "./ui/CalculatorUI";

// Box
export const Box = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <div className={`p-4 rounded-lg ${className}`}>{children}</div>;

// Text
export const Text = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <p className={className}>{children}</p>;

// Callout
export const Callout = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="p-4 rounded-md bg-indigo-50 border-l-4 border-indigo-500">
    <strong className="block mb-1">{title}</strong>
    <div>{children}</div>
  </div>
);

// AnimatedCard
export const AnimatedCard = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ y: 8, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className={`p-4 rounded-lg shadow ${className}`}
  >
    {children}
  </motion.div>
);

// Graph
export const Graph = ({
  data,
  xKey = "x",
  yKey = "y",
  height = 220,
}: {
  data: any[];
  xKey?: string;
  yKey?: string;
  height?: number;
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
      <Line dataKey={yKey} />
      <CartesianGrid />
      <XAxis dataKey={xKey} />
      <YAxis />
    </LineChart>
  </ResponsiveContainer>
);

// SVGCanvas
export const SVGCanvas = ({
  width = 600,
  height = 300,
  shapes = [],
}: {
  width?: number;
  height?: number;
  shapes: {
    type: "circle" | "line" | "path";
    [key: string]: any;
  }[];
}) => (
  <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    {shapes.map((s, i) => {
      if (s.type === "circle")
        return <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} />;
      if (s.type === "line")
        return (
          <line
            key={i}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke={s.stroke}
          />
        );
      if (s.type === "path")
        return (
          <path key={i} d={s.d} fill={s.fill || "none"} stroke={s.stroke} />
        );
      return null;
    })}
  </svg>
);

// Calculator
export const Calculator = ({
  formula,
  inputs,
  onResult,
}: {
  formula: string;
  inputs: { name: string; label: string; type?: string }[];
  onResult: (result: number) => void;
}) => <CalculatorUI formula={formula} inputs={inputs} onResult={onResult} />;

// Quiz
type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correct: string;
};

export const Quiz = ({
  questions,
  onComplete,
}: {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}) => <QuizComponent questions={questions} onComplete={onComplete} />;

// Timeline
export const Timeline = ({
  steps,
}: {
  steps: { title: string; desc: string }[];
}) => (
  <ol>
    {steps.map((s, i) => (
      <li key={i}>
        <strong>{s.title}</strong>
        <div>{s.desc}</div>
      </li>
    ))}
  </ol>
);

// CodeBlock
export const CodeBlock = ({
  code,
  language = "tsx",
}: {
  code: string;
  language?: string;
}) => (
  <pre className="rounded bg-slate-900 text-white p-3">
    <code>{code}</code>
  </pre>
);

// Math
export const Math = ({ tex }: { tex: string }) => (
  <div dangerouslySetInnerHTML={{ __html: katex.renderToString(tex) }} />
);
