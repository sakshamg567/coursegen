import { useState } from "react";

type CalcInput = {
  name: string;
  label: string;
  type?: string; // "number" etc
};

export const CalculatorUI = ({
  formula,
  inputs,
  onResult,
}: {
  formula: string;
  inputs: CalcInput[];
  onResult?: (result: number) => void;
}) => {
  const [values, setValues] = useState<Record<string, string>>({});

  const compute = () => {
    // still using Function() — your call, but typing is fine
    const fn = new Function(...inputs.map((i) => i.name), `return ${formula};`);

    const args = inputs.map((i) => parseFloat(values[i.name] || "0"));
    const result = fn(...args);
    onResult?.(result);
  };

  return (
    <div className="p-4 border rounded space-y-4 bg-gray-50">
      <h2 className="font-medium">{formula}</h2>

      {inputs.map((input) => (
        <div key={input.name}>
          <label className="block text-sm font-medium">{input.label}</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                [input.name]: e.target.value,
              }))
            }
          />
        </div>
      ))}

      <button
        onClick={compute}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Compute
      </button>
    </div>
  );
};
