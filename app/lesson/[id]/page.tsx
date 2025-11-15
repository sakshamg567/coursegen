"use client";

import { use, useEffect, useState } from "react";
import React from "react";
import * as RegistryComponents from "@/components/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

        // Wrap the code to inject React and all available components
        const wrappedCode = `
const React = window.__REACT__;
const { useState, useEffect, useCallback, useMemo, useRef } = React;

// Registry components
const {
  Box,
  Text,
  Card,
  Callout,
  Calculator,
  AnimatedCard,
  SVGCanvas,
  MathFormula,
  Timeline,
  Quiz,
  CodeBlock,
  Graph,
  Badge,
  Progress,
  Mermaid
} = window.__REGISTRY__;

// Shadcn UI components
const {
  Button,
  Input,
  Slider,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  RadioGroup,
  RadioGroupItem,
  Checkbox,
  Label
} = window.__SHADCN__;

${codeWithoutImports}

export default LessonComponent
`;

        // Expose React, registry components, and shadcn components globally
        (window as any).__REACT__ = React;
        (window as any).__REGISTRY__ = RegistryComponents;
        (window as any).__SHADCN__ = {
          Button,
          Input,
          Slider,
          Tabs,
          TabsContent,
          TabsList,
          TabsTrigger,
          Accordion,
          AccordionContent,
          AccordionItem,
          AccordionTrigger,
          Alert,
          AlertDescription,
          AlertTitle,
          Select,
          SelectContent,
          SelectItem,
          SelectTrigger,
          SelectValue,
          Switch,
          RadioGroup,
          RadioGroupItem,
          Checkbox,
          Label,
        };

        // Create a blob URL from the code
        const blob = new Blob([wrappedCode], {
          type: "application/javascript",
        });
        const url = URL.createObjectURL(blob);

        // Import from the blob URL
        const mod = await import(/* webpackIgnore: true */ url);

        // Clean up
        URL.revokeObjectURL(url);

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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!Comp) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="p-6 text-center text-gray-500">
          No component available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a]">
      <Comp />
    </div>
  );
}
