# Contributing to Blood Group Analyzer

Thank you for your interest in contributing to the Blood Group Analyzer project! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- A Google Gemini API key

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/yourusername/blood-group-analyzer.git
   cd blood-group-analyzer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Add your Gemini API key to .env
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── ...
├── services/           # Business logic and API calls
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── __tests__/      # Unit tests for utilities
│   ├── constants.ts    # Application constants
│   ├── helpers.ts      # Helper functions
│   ├── validation.ts   # Validation utilities
│   └── index.ts        # Exports
├── i18n/               # Internationalization
└── test/               # Test configuration
```

## 🛠️ Development Workflow

### Code Quality

We use several tools to maintain code quality:

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Vitest**: Testing

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run type-check      # Run TypeScript compiler

# Testing
npm run test            # Run tests
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage
```

### Before Committing

1. **Run code quality checks:**
   ```bash
   npm run lint
   npm run format:check
   npm run type-check
   ```

2. **Run tests:**
   ```bash
   npm run test
   ```

3. **Ensure build works:**
   ```bash
   npm run build
   ```

## 🧪 Testing Guidelines

- Write unit tests for utility functions
- Add integration tests for complex components
- Maintain test coverage above 80%
- Use descriptive test names and organize tests logically

### Test Structure

```typescript
describe('ComponentName', () => {
  describe('specific functionality', () => {
    it('should behave correctly when...', () => {
      // Test implementation
    });
  });
});
```

## 📝 Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Define proper interfaces for all data structures
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

### React

- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices for performance
- Use proper TypeScript types for props and state

### Styling

- Use Tailwind CSS for styling
- Follow consistent naming conventions
- Ensure responsive design
- Test accessibility features

## 🌐 Internationalization

When adding new features:

1. Add translation keys to both `public/i18n/locales/en.json` and `public/i18n/locales/fa.json`
2. Use the `t()` function for all user-facing text
3. Test both LTR (English) and RTL (Persian) layouts

## 🐛 Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

## 💡 Feature Requests

For new features:

- Describe the use case
- Explain the expected behavior
- Consider backwards compatibility
- Discuss implementation approach

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

Please be respectful and professional in all interactions. We welcome contributors from all backgrounds and experience levels.

## 📞 Questions?

If you have questions about contributing, feel free to:

- Open an issue for discussion
- Contact the maintainer via email
- Join our community discussions

Thank you for contributing to making genetic analysis more accessible! 🧬
