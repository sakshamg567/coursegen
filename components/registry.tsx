import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { QuizComponent } from "./ui/QuizComponent";
import { CalculatorUI } from "./ui/CalculatorUI";
import katex from "katex";
// Box: simple container
export const Box = ({ children, className = "" }) => (
  <div className={`p-4 rounded-lg ${className}`}>{children}</div>
);

// Text
export const Text = ({ children, className = "" }) => (
  <p className={`${className}`}>{children}</p>
);

// Callout (accent)
export const Callout = ({ title, children }) => (
  <div className="p-4 rounded-md bg-indigo-50 border-l-4 border-indigo-500">
    <strong className="block mb-1">{title}</strong>
    <div>{children}</div>
  </div>
);

// AnimatedCard (framer-motion)
export const AnimatedCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ y: 8, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className={`p-4 rounded-lg shadow ${className}`}
  >
    {children}
  </motion.div>
);

// Graph: small wrapper for recharts
export const Graph = ({ data, xKey = "x", yKey = "y", height = 220 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
      <Line dataKey={yKey} />
      <CartesianGrid />
      <XAxis dataKey={xKey} />
      <YAxis />
    </LineChart>
  </ResponsiveContainer>
);

// SVGCanvas: draw arbitrary svg shapes from JSON
export const SVGCanvas = ({ width = 600, height = 300, shapes = [] }) => (
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

// Calculator: small physics calculator the LLM can call interactively
export const Calculator = ({ formula, inputs, onResult }) => {
  // formula: "v = u + at" (string) - we provide UI for input names
  return <CalculatorUI formula={formula} inputs={inputs} onResult={onResult} />;
};

// Quiz: interactive multiple choice quizzes
export const Quiz = ({ questions, onComplete }) => (
  <QuizComponent questions={questions} onComplete={onComplete} />
);

// Timeline / Steps
export const Timeline = ({ steps }) => (
  <ol>
    {steps.map((s, i) => (
      <li key={i}>
        <strong>{s.title}</strong>
        <div>{s.desc}</div>
      </li>
    ))}
  </ol>
);

export const CodeBlock = ({ code, language = "tsx" }) => (
  <pre className="rounded bg-slate-900 text-white p-3">
    <code>{code}</code>
  </pre>
);

// Math (KaTeX)
export const Math = ({ tex }) => (
  <div dangerouslySetInnerHTML={{ __html: katex.renderToString(tex) }} />
);
