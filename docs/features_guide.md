# Trendora Features Guide

This document outlines the core user-facing features implemented on the platform.

## 📊 Live Dashboard
- **Real-Time Global Trends**: Fetches the top rising trends using PyTrends, falling back dynamically to RSS or realistic mock data if APIs fail.
- **Geographical Filtering**: Filter breaking internet trends by specific regions (US, IN, Worldwide).
- **Timeframe Scaling**: View rapid spikes (Past 1 Day) or long-term structural momentum (Past 1 Month).

## 🤖 AI Toolkit (Llama 3)
- **Trend Deconstruction**: Clicking on a trend card triggers Groq AI to instantly provide Context Summaries, 3 viral content Hooks, and related secondary keywords.
- **Script Generator**: Generates perfectly timed 60-second TikTok/YouTube Shorts scripts (Hook, Body, CTA) structured dynamically based on the current trend volume and velocity.
- **Context-Aware Assisant**: An intelligent chatbot embedded in the UI that can "see" the exact trends currently on your dashboard, allowing you to ask analytical questions about live data without hallucinations.

## 🏆 Community Leaderboard
- **Weekly Aggregation**: Pulls the highest-volume trends from the PostgreSQL cache over the past 7 days across out entire server network.
- **Pivotal Routing**: Users can click any item on the Global Leaderboard to instantly jump back to their personal dashboard pre-filtered with that keyword.

## 📌 Personal Vault (Saved Trends)
- **Quick-Saves**: Bookmark transient trends before they disappear.
- **Live Markdown Notetaking**: A dynamically resizing textarea automatically bound to your saved trends allowing for rapid content drafting and brainstorming.

## 🛡️ User Profile System
- **JWT Authentication**: Secure user login and registration protocols using encoded stateless tokens.
- **Dynamic Theming**: Persistent Dark/Light mode toggling natively tied to Tailwind classes.
