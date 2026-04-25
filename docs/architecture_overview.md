# Trendora Architecture Overview

This document provides a high-level overview of the architectural decisions and data flow within the Trendora platform.

## 1. System Architecture
Trendora is built on a loosely coupled Client-Server architecture.
- **Frontend Layer**: React.js SPA (Single Page Application) rendering dynamic UIs using Tailwind CSS and Framer Motion. Deployed natively on **Vercel**.
- **Backend Layer**: A lightweight Python Flask REST API server handling authentication, database constraints, and external API rate limiting. Deployed on **Render**.
- **Data Layer**: PostgreSQL database storing User Profiles, Bookmarked Trends, and a highly persistent **Global Trend Cache**.

## 2. Global Trend Cache & Rate Limit Bypassing
Google Trends restricts frequent API usage. To prevent `429 Too Many Requests` errors:
- We rely on `pytrends` to hit the API with strict categorical seed keywords.
- When live data arrives, it is aggressively cached into the PostgreSQL `trends` table with a timestamp (`fetched_at`).
- For the next 2 hours, any user requesting the same parameters is served directly from our PostgreSQL database instead of hitting Google Trends.

## 3. Real-Time RAG AI Pipeline (Llama 3 + Groq)
Trendora bypasses traditional bloated AI integrations by using Groq LPUs.
- **Context Injection**: When a user opens the AI Chatbot, the React frontend injects the entire visible array of live dashboard trends invisibly into the backend payload.
- **Prompt Guardrails**: The Flask backend processes this into a system prompt (*"You are Trendora AI... Here is the live dashboard data..."*) and forwards it to Meta's Llama-3-8B model. 
- **Latency**: Thanks to Groq hardware, complex JSON structural scripts and conversational replies are generated in under 300ms, creating a flawless UX.

## 4. JWT Secure Vault Implementation
- All routes requiring persistent user data use stateless JSON Web Tokens.
- A user's `sessionStorage` in the browser acts as a micro-cache for instantaneous rendering during layout switches without network latency.
