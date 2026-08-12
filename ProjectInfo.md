# Peptide Research Library — Project README

## Project Overview

This project is a modern peptide education and research website inspired by platforms like:

- PeptideDosages.com
- Extension Health
- structured medical documentation systems
- modern research libraries
- Apple/Notion-style readability

The site is NOT an ecommerce website.

The goal is to create a:

- peptide research database
- educational resource hub
- dosage/reconstitution guide platform
- protocol library
- clean modern medical/research UI

The site should feel:

- clinical
- premium
- educational
- organized
- modern
- trustworthy
- minimalist
- easy to navigate

NOT:
- spammy
- bodybuilding-forum style
- dark aggressive gym aesthetic
- cluttered
- overly corporate
- sales-heavy

---

# Primary Site Sections

## 1. Homepage
The homepage acts as the main portal into the peptide education ecosystem.

Sections include:
- hero section
- featured peptides
- essential guides
- popular protocols
- research categories
- educational disclaimers
- navigation to calculators and resources

The homepage should feel:
- welcoming to beginners
- organized for experienced users
- educational-first

---

## 2. Peptide Detail Pages (IMPORTANT)

The peptide detail page layout is the PRIMARY design language for the site.

Example:
- BPC-157 detail page

This layout should be reused stylistically across:
- guide pages
- protocols
- educational resources

The peptide pages include:
- hero/header section
- peptide overview
- benefit tags
- dosage protocol tables
- reconstitution instructions
- injection frequency
- duration
- supplies needed
- storage/handling
- research context
- references/sources
- disclaimers

Design characteristics:
- structured sections
- long-form readability
- modern clinical spacing
- research database feel
- premium typography
- muted color palette
- blue/red accent colors

DO NOT redesign peptide pages unless improving spacing/readability.

---

# Design System

## Visual Direction

The UI should feel like:
- Apple Health
- modern documentation systems
- premium medical dashboard
- research library
- clean blog/documentation hybrid

NOT:
- flashy startup landing pages
- crypto UI
- bodybuilding forums
- neon gradients
- cluttered dashboards

---

## Color Palette

Primary:
- blue accents
- muted red accents
- soft gray backgrounds
- white cards
- light borders

Use:
- subtle shadows
- soft borders
- restrained hover states
- minimal gradients

Avoid:
- oversaturated colors
- harsh contrasts
- excessive animations

---

## Typography

Typography is EXTREMELY important.

Goals:
- highly readable
- soft line spacing
- comfortable long-form reading
- premium educational feel

Use:
- large clean headers
- muted paragraph colors
- max-width reading containers
- generous spacing between sections

Avoid:
- cramped text
- dense blocks
- tiny fonts
- overly bold styling

---

# Essential Guides Section

The Guides section is one of the core educational systems of the website.

Current guides:
1. Beginner’s Guide to Peptides
2. How to Reconstitute Peptides
3. Syringe & Measurement Guide

The guide cards already exist visually and SHOULD NOT be heavily redesigned.

The guides must support:
- click-through article pages
- long-form educational content
- smooth navigation
- mobile responsiveness

---

## Guide UX Requirements

When clicking a guide card:
- open full guide detail page
- replace guide grid with article layout
- smooth scroll to top
- maintain single-page app feel

Guide pages should include:
- hero/title section
- disclaimer
- table of contents
- article sections
- styled lists
- readable spacing
- optional sticky TOC on desktop
- back button

The guide pages should visually match:
- peptide detail pages
- research library aesthetic

---

# Important Technical Constraints

## SINGLE FILE PREFERENCE

IMPORTANT:
Prefer keeping major sections consolidated into one file when possible.

Reason:
- easier AI-assisted editing
- easier iteration
- less fragmented context
- faster Replit/Claude workflow

Avoid unnecessary file splitting.

---

# Navigation Logic

Guide navigation should use React state:

Example:
```js
selectedGuide === null
// show guide cards

selectedGuide !== null
// show guide detail page