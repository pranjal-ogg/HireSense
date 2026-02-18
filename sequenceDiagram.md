# HireSense Main Flow: Sequence Diagram

The following sequence diagram illustrates the core journey of a candidate utilizing the HireSense platform.

```mermaid
sequenceDiagram
    autonumber
    
    actor User
    participant Frontend as Frontend (UI)
    participant Backend as Backend (API Layer)
    participant DB as Database (MongoDB)

    %% 1. Upload Phase
    User->>Frontend: Select & Upload PDF Resume
    Frontend->>Backend: POST /api/v1/resumes/upload (Multipart FormData)
    
    %% 2. Parsing Phase
    Backend->>Backend: Extract Text (pdf-parse)
    Backend->>Backend: Apply NLP & Keyword Rules
    Backend->>DB: Save Parsed Data & Raw Text
    DB-->>Backend: Return Saved Resume Document
    
    %% 3. Scoring & Suggestion Phase
    Backend->>Backend: Calculate ATS Readiness Score
    Backend->>Backend: Generate Improvement Suggestions
    Backend->>DB: Update Resume with Score & Suggestions
    DB-->>Backend: Confirm Update
    
    %% 4. Job Matching Phase
    Backend->>DB: Fetch Active Jobs Pool
    DB-->>Backend: Return Active Jobs
    loop For Each Job
        Backend->>Backend: Compare Skills, Experience & Degree
        Backend->>Backend: Calculate Match Score (%)
    end
    Backend->>DB: Save/Cache Top Match Results
    
    %% 5. Response Phase
    Backend-->>Frontend: Return Structured JSON (Score, Suggestions, Matches)
    Frontend-->>User: Render Dashboard with Results
```

### Flow Breakdown

1. **Upload Resume**: The user uploads their resume via the `Frontend`. The file is sent to the `Backend` via a multipart request.
2. **System Parses**: The `Backend` extracts the raw text from the PDF and runs it through the rule-based parsing engine to extract skills, education, and experience. This parsed structure is saved to the `Database`.
3. **Score & Suggestions Generated**: The `Backend` instantly evaluates the parsed data to calculate an ATS readiness score and generates a list of actionable suggestions (e.g., "Add more measurable metrics").
4. **Job Matching**: The `Backend` queries the `Database` for active jobs. It runs the parsed resume against each job's requirements, outputting a match percentage based on skill overlap and experience.
5. **Results Shown**: The final consolidated data is sent back to the `Frontend`, which renders the interactive dashboard for the `User`.
