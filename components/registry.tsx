"use client";

import { ReactNode, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import katex from "katex";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
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
  type = "info",
}: {
  title: string;
  children: ReactNode;
  type?: "info" | "warning" | "success" | "error";
}) => {
  const styles = {
    info: "bg-blue-500/10 border-l-4 border-blue-500 text-blue-100",
    warning: "bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-100",
    success: "bg-green-500/10 border-l-4 border-green-500 text-green-100",
    error: "bg-red-500/10 border-l-4 border-red-500 text-red-100",
  };

  return (
    <div className={`p-4 rounded-md ${styles[type]}`}>
      <strong className="block mb-1 font-semibold">{title}</strong>
      <div className="opacity-90">{children}</div>
    </div>
  );
};

// AnimatedCard
export const AnimatedCard = ({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, duration: 0.5 }}
    className={`p-4 rounded-lg shadow-lg ${className}`}
  >
    {children}
  </motion.div>
);

// Graph - Enhanced with more chart types
export const Graph = ({
  data,
  xKey = "x",
  yKey = "y",
  height = 300,
  type = "line",
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
}: {
  data: any[];
  xKey?: string;
  yKey?: string;
  height?: number;
  type?: "line" | "bar" | "pie";
  colors?: string[];
}) => {
  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey={yKey}
            nameKey={xKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey={xKey} stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
          />
          <Bar dataKey={yKey} fill={colors[0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey={xKey} stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
        />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={colors[0]}
          strokeWidth={2}
          dot={{ fill: colors[0] }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// SVGCanvas with animation support
export const SVGCanvas = ({
  width = 600,
  height = 300,
  children,
}: {
  width?: number;
  height?: number;
  children: ReactNode;
}) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    className="mx-auto"
  >
    {children}
  </svg>
);

// Mermaid diagram component
export const Mermaid = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (ref.current) {
        try {
          // Dynamically import mermaid
          const mermaid = (await import("mermaid")).default;
          mermaid.initialize({
            startOnLoad: true,
            theme: "dark",
            themeVariables: {
              darkMode: true,
              background: "#0a0a0a",
              primaryColor: "#3b82f6",
              primaryTextColor: "#fff",
              primaryBorderColor: "#1e40af",
              lineColor: "#6b7280",
              secondaryColor: "#10b981",
              tertiaryColor: "#f59e0b",
            },
          });

          const { svg } = await mermaid.render(
            `mermaid-${Math.random().toString(36).substr(2, 9)}`,
            chart,
          );
          ref.current.innerHTML = svg;
        } catch (error) {
          console.error("Mermaid rendering error:", error);
          ref.current.innerHTML = `<div class="text-red-500">Error rendering diagram</div>`;
        }
      }
    };

    renderDiagram();
  }, [chart]);

  return (
    <div
      ref={ref}
      className="flex items-center justify-center p-4 bg-[#0a0a0a] rounded-lg border border-gray-800"
    />
  );
};

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
  <div className="space-y-4">
    {steps.map((s, i) => (
      <div key={i} className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {i + 1}
          </div>
          {i < steps.length - 1 && (
            <div className="w-0.5 h-full bg-gray-700 mt-2" />
          )}
        </div>
        <div className="pb-8">
          <h3 className="font-semibold text-lg text-white mb-1">{s.title}</h3>
          <p className="text-gray-400">{s.desc}</p>
        </div>
      </div>
    ))}
  </div>
);

// CodeBlock
export const CodeBlock = ({
  code,
  language = "tsx",
}: {
  code: string;
  language?: string;
}) => (
  <pre className="rounded-lg bg-[#1e1e1e] text-gray-100 p-4 overflow-x-auto border border-gray-800">
    <code className="text-sm">{code}</code>
  </pre>
);

// MathFormula - renamed from Math to avoid shadowing native Math object
export const MathFormula = ({ tex }: { tex: string }) => (
  <div
    className="text-white my-2"
    dangerouslySetInnerHTML={{ __html: katex.renderToString(tex) }}
  />
);

// Card component
export const Card = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-[#1a1a1a] rounded-lg border border-gray-800 p-6 ${className}`}
  >
    {children}
  </div>
);

// Badge component
export const Badge = ({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error";
}) => {
  const styles = {
    default: "bg-blue-500/20 text-blue-300 border-blue-500/50",
    success: "bg-green-500/20 text-green-300 border-green-500/50",
    warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
    error: "bg-red-500/20 text-red-300 border-red-500/50",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

// Progress bar
export const Progress = ({ value = 0 }: { value: number }) => (
  <div className="w-full bg-gray-700 rounded-full h-2.5">
    <div
      className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

// Keep Math as an alias for backwards compatibility
export { MathFormula as Math };
