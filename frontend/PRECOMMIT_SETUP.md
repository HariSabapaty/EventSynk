# Pre-commit Hooks Setup Guide

This project uses **pre-commit hooks** to automatically check and format code before each commit.

## What's Included

### Backend (Python)
- **Ruff**: Fast Python linter and formatter (replaces Black + Flake8)
  - Automatically fixes code style issues
  - Checks for common errors
  - Enforces Python best practices

### Frontend (JavaScript/React)
- **ESLint**: JavaScript/React linter
  - Catches bugs and errors
  - Enforces React best practices
- **Prettier**: Code formatter
  - Consistent formatting across all files

### General
- Trailing whitespace removal
- End-of-file fixer
- YAML file validation
- Large file detection
- Merge conflict detection

## Installation

### 1. Install pre-commit (if not already installed)

```bash
# Backend - install Python dependencies
cd backend
pip install -r requirements.txt

# Frontend - install Node dependencies
cd frontend
npm install
```

### 2. Set up pre-commit hooks

From the **root directory** of the project:

```bash
pre-commit install
```

This registers the hooks with Git.

## Usage

### Automatic (Recommended)
Once installed, hooks run automatically on `git commit`. If any issues are found:
- **Auto-fixable issues**: Files are fixed automatically, you just need to re-add and commit
- **Manual fixes needed**: Commit is blocked until you fix the issues

### Manual Testing
Test hooks without committing:

```bash
# Run on all files
pre-commit run --all-files

# Run on specific files
pre-commit run --files backend/app.py frontend/src/App.jsx
```

### Manual Formatting

**Backend:**
```bash
cd backend
ruff check . --fix      # Lint and fix
ruff format .           # Format code
```

**Frontend:**
```bash
cd frontend
npm run lint            # Check for errors
npm run format          # Format code
```

## Bypassing Hooks (Not Recommended)

If you need to commit without running hooks:
```bash
git commit --no-verify -m "your message"
```

⚠️ **Warning**: Only use this in emergencies. CI pipeline will still catch issues!

## Configuration Files

- `.pre-commit-config.yaml` - Pre-commit hook configuration
- `backend/ruff.toml` - Ruff (Python) settings
- `frontend/.eslintrc.json` - ESLint (JavaScript) settings
- `frontend/.prettierrc` - Prettier (formatting) settings

## Troubleshooting

### Hook fails on first run
```bash
pre-commit clean
pre-commit install --install-hooks
```

### Update hooks to latest versions
```bash
pre-commit autoupdate
```

### Skip specific hook temporarily
```bash
SKIP=ruff git commit -m "message"
SKIP=eslint git commit -m "message"
```
