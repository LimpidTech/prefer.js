# Contributing to Prefer

Thank you for your interest in contributing to Prefer! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 14.0.0 or higher
- npm 7.0.0 or higher

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/prefer.git
   cd prefer
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Building

```bash
npm run build
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Check TypeScript types
npm run typecheck

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

### Clean Build Artifacts

```bash
npm run clean
```

## Code Quality Standards

### TypeScript

- Use strict TypeScript mode
- No `any` types (use `unknown` if necessary)
- Provide proper type definitions for all public APIs
- Use interfaces for object shapes

### Testing

- Maintain 100% test coverage
- Write tests before implementing features (TDD)
- Test both success and error cases
- Use descriptive test names

### Code Style

- Follow the existing code style
- Use Prettier for formatting
- Follow ESLint rules
- Write clear, self-documenting code
- Add comments for complex logic

## Pull Request Process

1. **Update tests**: Ensure all tests pass and add new tests for your changes
2. **Update documentation**: Update README.md and other docs as needed
3. **Run quality checks**:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

### Commit Message Format

We follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `chore:` - Build process or auxiliary tool changes

Example:
```
feat: add JSON5 support for configuration files

- Added JSON5Formatter class
- Updated tests
- Updated documentation
```

## CI/CD Pipeline

All pull requests automatically run through our CI pipeline:

1. **Linting** - ESLint checks
2. **Type Checking** - TypeScript compilation
3. **Testing** - Full test suite on Node 14, 16, 18, 20
4. **Build** - Verify build succeeds

## Release Process

Releases are automated through GitHub Actions:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a GitHub release with a tag (e.g., `v0.6.0`)
4. GitHub Actions will automatically publish to NPM

## Questions?

Feel free to open an issue for any questions or concerns!
