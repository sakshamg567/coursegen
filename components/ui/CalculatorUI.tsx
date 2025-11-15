// components/blocks/CalculatorUI.tsx
import { useState } from "react";

export const CalculatorUI = ({ formula, inputs, onResult }) => {
  // inputs = [{ name:"u", label:"Initial velocity", type:"number" }, ...]
  const [values, setValues] = useState({});

  const compute = () => {
    // extremely sandboxed, no eval
    // you can replace with safer math later
    const fn = new Function(...inputs.map((i) => i.name), `return ${formula};`);
    const args = inputs.map((i) => parseFloat(values[i.name] || 0));
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
              setValues((prev) => ({ ...prev, [input.name]: e.target.value }))
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
