---
alwaysApply: true
---

# React Development Rules & Best Practices

> Comprehensive guide for React + TypeScript development following modern best practices and standards.

---

## 🎯 **APPLICATION GUIDELINES**

- **🟢 Always Apply**: Core principles that should be followed in every React project
- **🟡 Apply Intelligently**: Guidelines that should be considered based on project context and requirements
- **🔴 Context-Dependent**: Rules that depend on specific project needs or constraints

---

## 🟢 **ALWAYS APPLY**

### **Accessibility (a11y)**

- Use semantic HTML elements
- Apply appropriate ARIA attributes
- Ensure full keyboard navigation support
- Test with screen readers and accessibility tools

### **Code Style & Structure**

- Write concise, technical TypeScript following Standard.js rules
- Use functional, declarative patterns; avoid classes
- Favor loops and small helper modules over duplicate code
- Use descriptive names with auxiliary verbs (e.g., `isLoading`, `hasError`)
- File layout: exported component → subcomponents → hooks/helpers → static content

### **Error Handling & Validation**

- Validate inputs and preconditions early (guard clauses)
- Place happy-path logic last
- Provide clear, user-friendly error messages
- Log or report unexpected errors

### **TypeScript Configuration**

- Enable `"strict": true` in tsconfig.json
- Explicitly type function returns and object literals
- Enforce `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`
- Minimize use of `@ts-ignore`/`@ts-expect-error`

### **Standard.js Rules**

- 2-space indentation
- Single quotes (except to avoid escaping)
- No semicolons (unless disambiguation requires)
- No unused variables
- Space after keywords (`if (... )`)
- Space before function's `(`
- Always use `===` / `!==`
- Operators spaced (`a + b`)
- Commas followed by space
- `else` on same line as closing `}`
- Multi-line if blocks always use `{ }`
- Always handle error callback parameters
- camelCase for variables/functions; PascalCase for components and interfaces

---

## 🟡 **APPLY INTELLIGENTLY**

### **Forms & Validation**

- Use controlled inputs
- For simple forms, write custom hooks; for complex ones, use react-hook-form with generics (e.g., `<Controller>`)
- Separate client-side and server-side validation
- Optionally integrate a schema library (e.g., Joi) if needed

### **Performance Optimization**

- Minimize client-only code (`useEffect`/`useState`) where unnecessary
- Dynamically import non-critical components
- Optimize images (WebP, width/height, lazy-loading)
- Memoize expensive computations with `useMemo`
- Wrap pure components in `React.memo`
- Structure modules for effective tree-shaking

### **State Management**

- Global state: Zustand
- Lift state up before introducing context
- Use React Context for intermediate, tree-wide sharing

### **UI & Styling (SCSS Modules)**

- Co-locate a `.scss` file with each component
- Leverage SCSS features:
  - Variables (`$primary-color`, `$spacing`)
  - Mixins (`@mixin flexCenter`)
  - Parent selector & pseudo-classes (`&:hover`)
  - Partials (`_variables.scss`, `_mixins.scss`) imported in `styles/index.scss`
- Name classes in camelCase or BEM (`.card__header`)
- Keep global styles minimal (e.g., reset, typography)

---

## 🔴 **CONTEXT-DEPENDENT**

### **Naming Conventions**

- Directories: lowercase with dashes (e.g., `components/auth-wizard`)
- File extensions:
  - Components → `.tsx`
  - Hooks/Utils → `.ts`
  - Style modules → `.module.scss`
- Prefer named exports for components
- Types/Interfaces in PascalCase (e.g., `User`, `ButtonProps`)

---

## 📋 **REACT + TYPESCRIPT BEST PRACTICES**

### **Component Structure**

```typescript
interface ButtonProps {
  label: string;
  onClick?: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

### **Hooks Guidelines**

- Call hooks (`useState`, `useEffect`, etc.) only at the top level
- Extract reusable logic into custom hooks (`useAuth`, `useFormValidation`)
- Memoize with `React.memo`, `useCallback`, `useMemo` where appropriate
- Avoid inline functions in JSX—pull handlers out or wrap in `useCallback`
- Clean up effects in `useEffect` to prevent leaks

### **Component Patterns**

- Favor composition (render props, children) over inheritance
- Use `React.lazy` + `Suspense` for code splitting
- Use refs only for direct DOM access
- Prefer controlled components for forms
- Implement an error boundary component
- Use guard clauses (early returns) for error handling

---

## 🚀 **ADVANCED PATTERNS**

### **Error Boundaries**

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

### **Custom Hooks Pattern**

```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

### **Performance Optimization Examples**

```typescript
// Memoized component
const ExpensiveComponent = React.memo(({ data }: Props) => {
  const processedData = useMemo(() => {
    return data.map((item) => expensiveProcessing(item));
  }, [data]);

  return <div>{processedData}</div>;
});

// Lazy loading
const LazyComponent = React.lazy(() => import("./LazyComponent"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

---

## 📝 **CHECKLIST FOR NEW COMPONENTS**

### **Before Implementation**

- [ ] Define TypeScript interfaces for props
- [ ] Plan component structure and hierarchy
- [ ] Consider accessibility requirements
- [ ] Determine if component needs memoization

### **During Implementation**

- [ ] Use semantic HTML elements
- [ ] Add appropriate ARIA attributes
- [ ] Implement proper error handling
- [ ] Add TypeScript types for all functions and variables
- [ ] Follow naming conventions
- [ ] Use controlled inputs for forms

### **After Implementation**

- [ ] Test keyboard navigation
- [ ] Verify accessibility with screen readers
- [ ] Check performance with React DevTools
- [ ] Review code for potential optimizations
- [ ] Add error boundaries if needed
- [ ] Document component usage and props

---

## 🔧 **TOOLS & LINTING**

### **Recommended ESLint Configuration**

```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

### **Prettier Configuration**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## 📚 **RESOURCES & REFERENCES**

- [React Official Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Accessibility](https://react.dev/learn/accessibility)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Standard.js](https://standardjs.com/)

---

_Last Updated: [Date]_
_Review and update these rules regularly as React ecosystem evolves._
