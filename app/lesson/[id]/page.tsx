"use client";

import { use, useEffect, useState } from "react";
import React from "react";

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [Comp, setComp] = useState<React.FunctionComponent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = use(params);

  useEffect(() => {
    async function load() {
      try {
        // Fetch the compiled code from our API route
        const response = await fetch(`/api/lesson/${id}`);

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || `Failed to fetch: ${response.status}`,
            );
          }
          throw new Error(
            `Failed to fetch: ${response.status} ${response.statusText}`,
          );
        }

        const code = await response.text();

        // Remove the imports since we'll provide React directly
        const codeWithoutImports = code
          .replace(/import\s+React\s+from\s+['"][^'"]+['"];?\s*/g, "")
          .replace(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]react['"];?\s*/g, "")
          .replace(
            /import\s+{\s*([^}]+)\s*}\s+from\s+['"]https:\/\/esm\.sh\/react@\d+['"];?\s*/g,
            "",
          );

        // Wrap the code to inject React
        const wrappedCode = `
const React = window.__REACT__;
const { useState, useEffect, useCallback, useMemo, useRef } = React;

${codeWithoutImports}

export default LessonComponent

`;

        // Expose React globally for the dynamic module
        (window as any).__REACT__ = React;

        // Create a blob URL from the code
        const blob = new Blob([wrappedCode], {
          type: "application/javascript",
        });
        const url = URL.createObjectURL(blob);

        // Import from the blob URL
        const mod = await import(/* webpackIgnore: true */ url);

        // Clean up
        URL.revokeObjectURL(url);
        delete (window as any).__REACT__;

        // Get the component
        const Component = mod.LessonComponent || mod.default;
        if (!Component) {
          throw new Error(
            "No component found in module exports: " +
              Object.keys(mod).join(", "),
          );
        }

        setComp(() => Component);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load lesson component",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
        </div>
        <p className="mt-4 text-gray-600">Loading lesson...</p>
      </div>
    );
  }

  if (!Comp) {
    return (
      <div className="p-6 text-center text-gray-500">
        No component available
      </div>
    );
  }

  return (
    <div>
      <Comp />
    </div>
  );
}
