# 🌿 The Green Compiler

The **Green Compiler** is a specialized static analysis engine designed to treat **Energy (Joules)** as a first-class citizen in the compilation and development lifecycle. It addresses the "Carbon Cost of Code" by providing a framework that weighs, analyzes, and optimizes Python algorithms for environmental sustainability.

## 🚀 The Mission

Most compilers optimize for **Speed** or **Memory**. The Green Compiler optimizes for **Planet**.

As data centers consume an increasing share of global power, writing "Green Code" is no longer optional. This tool solves the visibility problem by:
1. **Energy Weighting**: Assigning an Energy Consumption Score (ECS) to every AST node.
2. **Carbon Budgeting**: Visualizing how many "Energy Points" a function costs per execution.
3. **Automated De-nesting**: Identifying loops and I/O patterns that keep CPUs in high-power states longer than necessary.

## 🛠️ Technical Implementation

### The Analysis Engine
The compiler uses a custom Lexer and Recursive Descent Parser to convert Python source into an Abstract Syntax Tree (AST). Instead of generating machine code, it generates an **Energy Map**:
- **O(N) Loops**: Linear energy growth.
- **O(√N) Optimizations**: Drastic reduction in CPU wake-cycles.
- **I/O Smells**: Identifying high-energy "Wake-ups" (simulated disk/network calls).

### The UI Stack
- **React 18 + TypeScript**: For a robust, typed analysis environment.
- **Tailwind CSS**: Using a "Terminal + Forest" aesthetic (Deep grays and vibrant greens).
- **Recharts**: For visualizing the distribution of energy smells.
- **Framer Motion**: To simulate the flow of energy through the logic gates.

---

## ⚡ Deployment & Build
The project is optimized for deployment via **Vite**.
- **Build**: `npm run build`
- **Dev**: `npm run dev`

© 2026 Green Compiler. All rights reserved. Unauthorized copying, reproduction, modification, or redistribution of this project's source code or original materials is prohibited, except as permitted by applicable law.
