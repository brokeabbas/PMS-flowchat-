# Flowchart Project Management Prototype

An interactive project-management interface that represents clients, documents, enquiries, and delivery stages as an expandable visual workflow.

## What it demonstrates

- Hierarchical workflow modelling with React Flow
- Expandable and collapsible project subtrees
- Automatic node layout and viewport fitting
- Custom nodes, animated edges, and navigation controls
- Contextual document and client-enquiry sidebars
- Responsive application shell and reusable UI components

## Stack

React 19, TypeScript, React Flow, Tailwind CSS, Framer Motion, Axios and Vite.

## Run locally

```bash
cp .env.example .env
npm ci
npm run dev
```

Create a production build with `npm run build`.

## Configuration

`VITE_API_BASE_URL` controls the optional backend endpoint. The current prototype uses mock workflow data, so the main interface can be explored without a running API.

## Project status

This is a product-interface prototype created to explore a non-traditional, flowchart-driven approach to technical project management. Authentication and form persistence are intentionally represented at prototype level.
