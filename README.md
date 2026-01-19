# ML Platform

A React-based web application for managing ML models in an organization.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Plain CSS
- **Build Tool**: Vite
- **Containerization**: Docker with multi-stage build

## Features

- View all ML models in a card layout
- Create new models with a form modal (local mode)
- Edit existing model information (local mode)
- Delete models with confirmation (local mode)
- Search and filter models by status
- Responsive design for mobile and desktop
- **GitHub Integration**: Connect to a GitHub repo to load models from a config file

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## Docker

### Build the Docker image

```bash
docker build -t ideal-ml .
```

### Run the container

```bash
docker run -p 80:80 ideal-ml
```

The app will be accessible at [http://localhost](http://localhost).

## Project Structure

```
src/
├── components/
│   ├── Layout/         # Main layout with sidebar
│   ├── ModelCard/      # Individual model display
│   ├── ModelList/      # List with search/filter
│   ├── ModelForm/      # Create/edit form modal
│   ├── Settings/       # GitHub connection settings
│   └── UserInfo/       # User info in sidebar
├── services/
│   └── github.ts       # GitHub API & caching
├── data/
│   └── mockData.ts     # Sample models (local mode)
├── types/
│   └── index.ts        # TypeScript interfaces
├── App.tsx             # Main app with state
├── App.css             # Global styles
└── main.tsx            # Entry point
```

## GitHub Integration

The platform can load models from a GitHub repository config file.

### Setup

1. Create a config file in your repo (e.g., `models.yaml` or `models.json`)
2. Click **Settings** in the sidebar
3. Enter your GitHub details:
   - **Owner**: GitHub username or organization
   - **Repository**: Repository name
   - **Branch**: Branch name (default: `main`)
   - **Config Path**: Path to config file (default: `models.yaml`)
   - **Token**: GitHub Personal Access Token with `repo` scope

### Config File Format

**YAML format** (`models.yaml`):
```yaml
- id: model-1
  name: Customer Churn Predictor
  version: 2.1.0
  description: Predicts customer churn probability
  framework: PyTorch
  status: production
  owner: Sarah Chen
  createdAt: 2024-08-15T10:30:00Z
  updatedAt: 2024-12-01T14:22:00Z
  metrics:
    accuracy: 0.92
    latency: 45

- id: model-2
  name: Fraud Detection
  version: 3.0.1
  description: Real-time fraud detection
  framework: TensorFlow
  status: staging
  owner: Mike Johnson
```

**JSON format** (`models.json`):
```json
[
  {
    "id": "model-1",
    "name": "Customer Churn Predictor",
    "version": "2.1.0",
    "description": "Predicts customer churn probability",
    "framework": "PyTorch",
    "status": "production",
    "owner": "Sarah Chen",
    "metrics": {
      "accuracy": 0.92,
      "latency": 45
    }
  }
]
```

### Caching

- Models are cached in localStorage for 5 minutes
- Click the refresh button (↻) to force reload from GitHub
- Disconnecting clears the cache

## Model Statuses

- **Development**: Model is being developed
- **Staging**: Model is being tested
- **Production**: Model is live
- **Archived**: Model is deprecated
