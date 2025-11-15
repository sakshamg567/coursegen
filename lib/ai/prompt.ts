export const __lesson_writer_base_prompt = ({
  title,
  objective,
}: {
  title: string;
  objective: string;
}) => {
  return `Generate a complete, self-contained React component for the following lesson:
  Title: ${title}
  Objective: ${objective}

  ## CRITICAL REQUIREMENTS

  1. Generate ONLY the component code - no imports, no exports, no markdown
  2. The component MUST be named "LessonComponent"
  3. Use modern React patterns (hooks, functional components)
  4. The code must be production-ready and error-free
  5. MUST have ALL closing tags - validate JSX is complete
  6. Use native JavaScript Math object for calculations (Math.round, Math.floor, etc.)

  ## STYLING REQUIREMENTS - STRICT DARK THEME

  **⚠️ CRITICAL: TEXT CONTRAST RULES - ALWAYS FOLLOW**

  **Dark Backgrounds MUST have Light Text:**
  - \`bg-[#0a0a0a]\` → \`text-white\` or \`text-gray-100\`
  - \`bg-[#121212]\` → \`text-white\` or \`text-gray-200\`
  - \`bg-[#1a1a1a]\` → \`text-white\` or \`text-gray-200\`
  - \`bg-gray-900\` → \`text-white\`
  - \`bg-blue-600\` → \`text-white\`
  - \`bg-green-600\` → \`text-white\`

  **Light Backgrounds MUST have Dark Text:**
  - \`bg-white\` → \`text-gray-900\`
  - \`bg-gray-100\` → \`text-gray-900\`
  - \`bg-blue-50\` → \`text-blue-900\`
  - \`bg-green-50\` → \`text-green-900\`

  **NEVER use:**
  - Black text on dark backgrounds
  - White text on light backgrounds
  - \`text-black\` on \`bg-[#0a0a0a]\`
  - \`text-gray-900\` on \`bg-[#1a1a1a]\`

  **Root Structure (MANDATORY):**
  \`\`\`tsx
  function LessonComponent() {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6 md:space-y-8">
          {/* All content here */}
        </div>
      </div>
    );
  }
  \`\`\`

  **Typography Hierarchy:**
  - H1 (Main Title): \`text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4\`
  - H2 (Section): \`text-2xl md:text-3xl font-bold text-white mb-4\`
  - H3 (Subsection): \`text-xl md:text-2xl font-semibold text-white mb-3\`
  - H4 (Card Title): \`text-lg md:text-xl font-semibold text-gray-100 mb-2\`
  - Body Text: \`text-base md:text-lg text-gray-300 leading-relaxed\`
  - Muted Text: \`text-sm text-gray-400\`
  - Labels: \`text-sm font-medium text-gray-400 mb-2 block\`
  - Small Text: \`text-xs text-gray-500\`

  **Card Components:**
  \`\`\`tsx
  <Card>  {/* Already has bg-[#1a1a1a] + border */}
    <h2 className="text-2xl font-bold text-white mb-4">Title</h2>
    <p className="text-gray-300">Content with proper contrast</p>
  </Card>
  \`\`\`

  **Stat Cards:**
  \`\`\`tsx
  <div className="bg-[#121212] border border-gray-800 rounded-lg p-4">
    <div className="text-xs text-gray-500 mb-1">Label</div>
    <div className="text-2xl font-bold text-blue-400">Value</div>
  </div>
  \`\`\`

  **Buttons:**
  - Primary: \`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors\`
  - Secondary: \`bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium\`
  - Success: \`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium\`
  - Danger: \`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium\`
  - Outline: \`border border-gray-700 hover:bg-gray-800 text-gray-300 px-4 py-2 rounded-lg\`

  **Input Elements:**
  \`\`\`tsx
  <Input
    className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500"
    placeholder="Enter value..."
  />
  \`\`\`

  **SVG Text Elements:**
  - ALWAYS use light colors: \`fill="#9ca3af"\` or \`fill="#d1d5db"\` or \`fill="white"\`
  - NEVER use \`fill="black"\` or \`fill="#000"\`
  - Example: \`<text x="10" y="20" fill="#9ca3af" fontSize="12">Label</text>\`

  **Responsive Design:**
  - Mobile breakpoints: \`sm:640px md:768px lg:1024px xl:1280px\`
  - Grid: \`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6\`
  - Flex: \`flex flex-col md:flex-row gap-4\`
  - Text: \`text-sm md:text-base lg:text-lg\`
  - Padding: \`p-4 md:p-6 lg:p-8\`
  - SVG: Make viewBox responsive, scale with container width

  ## AVAILABLE COMPONENTS

  **Registry Components:**
  - \`<Card>{children}</Card>\` - Dark card with border
  - \`<Callout title="..." type="info|warning|success|error">{children}</Callout>\`
  - \`<AnimatedCard delay={0.2}>{children}</AnimatedCard>\`
  - \`<Badge variant="default|success|warning|error">Text</Badge>\`
  - \`<Progress value={75} />\`
  - \`<Timeline steps={[{title:"",desc:""}]} />\`
  - \`<Graph data={[]} xKey="x" yKey="y" type="line|bar|pie" height={300} />\`
  - \`<MathFormula tex="x^2 + y^2 = z^2" />\`
  - \`<CodeBlock code="..." language="tsx" />\`
  - \`<Mermaid chart={\`graph TD; A-->B;\`} />\`
  - \`<SVGCanvas width={600} height={300}>{children}</SVGCanvas>\`
  - \`<Quiz questions={[]} onComplete={(score)=>{}} />\`
  - \`<Calculator formula="x+y" inputs={[]} onResult={(r)=>{}} />\`

  **Shadcn Components:**
  - \`<Button variant="default|outline|ghost">Text</Button>\`
  - \`<Input />\`
  - \`<Slider value={[50]} onValueChange={(v)=>setValue(v[0])} min={0} max={100} />\`
  - \`<Tabs>\`, \`<TabsList>\`, \`<TabsTrigger>\`, \`<TabsContent>\`
  - \`<Accordion>\`, \`<AccordionItem>\`, \`<AccordionTrigger>\`, \`<AccordionContent>\`
  - \`<Select>\`, \`<SelectTrigger>\`, \`<SelectContent>\`, \`<SelectItem>\`
  - \`<Switch checked={} onCheckedChange={} />\`
  - \`<Label>Text</Label>\`

  ## INTERACTIVE SVG VISUALIZATIONS - WITH FULL CONTROLS

  **MANDATORY: Every interactive visualization MUST have:**
  1. **Play/Pause button** - Control animation state
  2. **Reset button** - Return to initial state
  3. **Speed control** - Adjust animation speed
  4. **Parameter sliders** - Control all relevant variables
  5. **Current values display** - Show all parameters in real-time

  **Complete Interactive Pattern:**

  \`\`\`tsx
  function LessonComponent() {
    // Animation state
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [speed, setSpeed] = React.useState(1);
    const [time, setTime] = React.useState(0);

    // Parameters
    const [velocity, setVelocity] = React.useState(50);
    const [angle, setAngle] = React.useState(45);

    // Reset function
    const handleReset = () => {
      setTime(0);
      setIsPlaying(false);
      setVelocity(50);
      setAngle(45);
      setSpeed(1);
    };

    // Animation loop
    React.useEffect(() => {
      if (!isPlaying) return;

      const interval = setInterval(() => {
        setTime(t => t + 0.1 * speed);
      }, 100);

      return () => clearInterval(interval);
    }, [isPlaying, speed]);

    // Calculations
    const radians = (angle * Math.PI) / 180;
    const vx = velocity * Math.cos(radians);
    const vy = velocity * Math.sin(radians);

    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-4xl mx-auto p-6 space-y-6">

          <Card>
            <h2 className="text-2xl font-bold text-white mb-4">Interactive Simulation</h2>

            {/* Control Panel */}
            <div className="bg-[#121212] border border-gray-800 rounded-lg p-4 mb-6 space-y-4">

              {/* Play/Pause/Reset Controls */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </Button>

                <Button
                  onClick={handleReset}
                  className="bg-gray-700 hover:bg-gray-600 text-white"
                >
                  🔄 Reset
                </Button>

                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <span className="text-sm text-gray-400 whitespace-nowrap">Speed: {speed.toFixed(1)}x</span>
                  <Slider
                    value={[speed]}
                    onValueChange={(v) => setSpeed(v[0])}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Parameter Controls */}
              <div className="space-y-3">
                <div>
                  <Label className="text-gray-400 mb-2 block">
                    Velocity: {velocity} m/s
                  </Label>
                  <Slider
                    value={[velocity]}
                    onValueChange={(v) => setVelocity(v[0])}
                    min={10}
                    max={100}
                    step={1}
                  />
                </div>

                <div>
                  <Label className="text-gray-400 mb-2 block">
                    Angle: {angle}°
                  </Label>
                  <Slider
                    value={[angle]}
                    onValueChange={(v) => setAngle(v[0])}
                    min={0}
                    max={90}
                    step={1}
                  />
                </div>
              </div>

              {/* Current Status */}
              <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-700">
                <div className="text-sm">
                  <span className="text-gray-500">Time:</span>{' '}
                  <span className="text-blue-400 font-semibold">{time.toFixed(2)}s</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Status:</span>{' '}
                  <span className="text-green-400 font-semibold">
                    {isPlaying ? 'Running' : 'Paused'}
                  </span>
                </div>
              </div>
            </div>

            {/* Visualization */}
            <div className="bg-[#121212] border border-gray-800 rounded-lg p-4">
              <SVGCanvas width={600} height={400}>
                {/* SVG content with proper light-colored text */}
                <text x="10" y="20" fill="#9ca3af" fontSize="14">
                  v = {velocity} m/s
                </text>
                <text x="10" y="40" fill="#9ca3af" fontSize="14">
                  θ = {angle}°
                </text>

                {/* Visual elements */}
                <circle cx={100 + time * vx} cy={200 - time * vy} r="8" fill="#3b82f6" />
              </SVGCanvas>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="bg-[#121212] border border-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Velocity</div>
                <div className="text-lg font-bold text-blue-400">{velocity} m/s</div>
              </div>
              <div className="bg-[#121212] border border-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Angle</div>
                <div className="text-lg font-bold text-green-400">{angle}°</div>
              </div>
              <div className="bg-[#121212] border border-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Vx</div>
                <div className="text-lg font-bold text-yellow-400">{vx.toFixed(1)} m/s</div>
              </div>
              <div className="bg-[#121212] border border-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Vy</div>
                <div className="text-lg font-bold text-purple-400">{vy.toFixed(1)} m/s</div>
              </div>
            </div>

          </Card>
        </div>
      </div>
    );
  }
  \`\`\`

  ## SVG STYLING RULES

  **Text in SVG (CRITICAL):**
  \`\`\`tsx
  {/* ✅ CORRECT - Light text on dark background */}
  <text fill="#9ca3af" fontSize="12">Label</text>
  <text fill="#d1d5db" fontSize="14">Value</text>
  <text fill="white" fontSize="16">Title</text>

  {/* ❌ WRONG - Never use dark text */}
  <text fill="black">Label</text>
  <text fill="#000">Value</text>
  \`\`\`

  **SVG Elements:**
  - Backgrounds: \`fill="none"\` or \`fill="#121212"\`
  - Strokes: Use bright colors - \`#3b82f6\`, \`#10b981\`, \`#f59e0b\`, \`#ef4444\`
  - Gridlines: \`stroke="#374151"\` or \`stroke="#4b5563"\`
  - Axes: \`stroke="#6b7280"\`
  - Labels: \`fill="#9ca3af"\` or lighter

  ## MERMAID DIAGRAMS

  \`\`\`tsx
  <Mermaid chart={\`
    graph TD
      A[Start] -->|Action| B{Decision}
      B -->|Yes| C[Result 1]
      B -->|No| D[Result 2]
  \`} />
  \`\`\`

  ## CRITICAL CHECKLIST

  Before outputting, verify:
  - [ ] Root div has \`bg-[#0a0a0a] text-white\`
  - [ ] ALL headings use \`text-white\`
  - [ ] ALL body text uses \`text-gray-300\` or lighter
  - [ ] ALL SVG text uses \`fill="#9ca3af"\` or lighter colors
  - [ ] NO black text on dark backgrounds
  - [ ] ALL interactive visualizations have Play/Pause/Reset
  - [ ] ALL sliders have visible labels with current values
  - [ ] ALL stat cards show values in bright colors
  - [ ] Mobile responsive classes applied
  - [ ] All JSX tags properly closed

  Now generate an engaging, interactive lesson component for: ${objective}

  Return ONLY the function code, starting with "function LessonComponent()" and ending with the closing brace.`;
};

export const __lesson_writer_error_prompt = ({
  lastErr,
  generated_code,
}: {
  lastErr: string;
  generated_code: string;
}) => {
  return `The following React TSX component failed to compile or render:

  Error: ${lastErr}

  Broken Code:
  ${generated_code}

  Fix it and output a **working corrected version** of the same component.

  Common fixes:
  - Ensure all JSX tags are properly closed
  - Use MathFormula for LaTeX, not Math object
  - Check for syntax errors in template literals
  - Validate all event handlers
  - Ensure state is properly initialized
  - Check for missing parentheses or braces
  - Verify Slider: \`value={[number]} onValueChange={(v) => setValue(v[0])}\`
  - Fix text contrast: Dark backgrounds need light text
  - SVG text must use light colors: \`fill="#9ca3af"\`
  - Verify all interactive controls are present

  Rules:
  - Keep the same function name (LessonComponent)
  - Return only the function code
  - It must compile and render without error
  - Maintain dark theme with proper text contrast
  - Keep ALL interactive features working (Play/Pause/Reset)`;
};
