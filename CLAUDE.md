# Sourcebook Dashboard - Development Context

This file contains important context for Claude Code about this project.

## Project Overview

We are building a unified, professional dashboard for HousingForward Virginia's Sourcebook data platform. The goal is to move from individual website-style pages to a cohesive dashboard format that can house dozens of data applications.

## Key Requirements

### Design Vision
- **Professional, smooth sidebar** (not cartoony) with topics organized into sections
- **Two-level navigation**: Topics → Sub-pages (e.g., Inventory → Housing Type, Housing Age, etc.)
- **Clean, modern styling** matching HousingForward Virginia branding
- **Easy client handoff** using Quarto for maintainability

### Technical Approach
- **Quarto dashboard format** with custom CSS/SCSS styling
- **Embedded Shiny apps** as iframes for each sub-page
- **Geographic selection** (State/CBSA/Locality) that persists across apps via URL parameters
- **JavaScript-based navigation** for smooth page transitions

### Content Structure
Each sub-page follows this template:
1. **Overview text** explaining the topic
2. **Detailed descriptions** with methodology and definitions  
3. **Embedded Shiny app** as full-width iframe
4. **Data sources and resources** at bottom

### Example Content (Housing Type)
```
The dashboards on this page break down housing stock by the number of homes within each building. For example, a 1-unit residential building is a single-family home, while a 5-unit residential building is a small apartment complex. These data are helpful in understanding the makeup of a community's housing supply, overall density, and construction trends.

Housing type by tenure
This dashboard shows the current supply of occupied housing units among owners, renters, and all households, broken down by number of homes within each building.

All homes are classified into one of the following six categories:
- Single-family (detached) are homes with one living unit that does not share any walls with another home.
- Single-family (attached) are homes with one living unit that shares at least one wall with another home.
- Small-scale multifamily are homes in buildings with 2 to 19 total units...
[etc.]
```

## Brand Guidelines

**HousingForward Virginia Colors:**
- Primary Navy: #011E41
- Secondary Teal: #40C0C0
- Light Background: #E8EDF2

**Typography:** Clean, professional sans-serif with clear hierarchy

**Visual Style:** Based on existing Sourcebook pages showing professional data visualizations with clean tabs and organized sections.

## Technical Implementation

### Navigation Structure
```
Demographics
├── Total Population
├── Population Change  
├── Race and Ethnicity
├── Age
├── Household Type
└── Household Size

Inventory
├── Housing Production (Building Permits)
├── Housing Type
├── Housing Age
├── Housing Characteristics
└── Overcrowding

[Additional sections as needed]
```

### URL Bookmarking System
Geographic selections in sidebar should pass parameters to embedded iframes:
- `?geo=state` for Virginia statewide
- `?geo=cbsa&cbsa=richmond` for metro areas
- `?geo=locality&locality=richmond_city` for localities

### Existing Infrastructure
There's a separate `sourcebook-dashboard` repo with existing Shiny apps that can be referenced for iframe URLs, but this is a fresh start for the unified interface.

## Development Status

✅ **Completed:**
- Clean repository structure initialized
- Quarto dashboard configuration (_quarto.yml)
- Professional HFV styling (www/custom.scss) with brand colors
- JavaScript navigation system (www/dashboard.js) with URL bookmarking
- Main dashboard.qmd with sidebar navigation and content structure
- Example content pages for Demographics and Housing Type
- App URL configuration system (config/apps.yml)

🔄 **Next Steps:**
- Test Quarto rendering (`quarto render dashboard.qmd`)
- Add more content pages following the housing-type.md template
- Update app URLs in config/apps.yml with actual Shiny app URLs from existing sourcebook-dashboard
- Test geographic parameter passing to iframes
- Add mobile responsiveness testing

## File Structure Created
```
sourcebook-unified-dashboard/
├── README.md
├── CLAUDE.md (this file)
├── _quarto.yml (dashboard config)
├── dashboard.qmd (main interface)
├── www/
│   ├── custom.scss (HFV brand styling)
│   ├── dashboard.js (navigation & URL handling)
│   └── hfv_rgb_logo.png
├── content/
│   ├── demographics/_metadata.yml
│   └── inventory/housing-type.md (example)
├── config/
│   └── apps.yml (Shiny app URLs)
└── .gitignore
```

## Development Notes

- Use TodoWrite tool to track progress throughout development
- Focus on professional, accessible design
- Ensure smooth transitions and loading states
- Test geographic parameter passing thoroughly
- Keep content easily editable in Markdown format
- The JavaScript handles URL bookmarking: `?geo=state` or `?geo=cbsa&cbsa=richmond`
- Each iframe gets `data-base-url` attribute that JS uses to build final URLs