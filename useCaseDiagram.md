# HireSense Use Case Diagram

The following diagram outlines the primary actors and their interactions with the HireSense platform.

```mermaid
flowchart LR
    %% Actors
    User((User))
    Admin((Admin))

    %% System Boundary
    subgraph HireSense Platform
        %% User Actions
        UC1([Register / Login])
        UC2([Upload Resume])
        UC3([View Score])
        UC4([Get Suggestions])
        UC5([View Jobs])
        UC6([Save Jobs])

        %% Admin Actions
        UC7([Manage Jobs])
        UC8([View Analytics])
    end

    %% User Relationships
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6

    %% Admin Relationships
    Admin --> UC1
    Admin --> UC7
    Admin --> UC8
```

### Breakdown of Actors and Use Cases

#### Actors
* **User**: A job seeker utilizing the platform to analyze their resume and find matching jobs.
* **Admin**: A recruiter or system administrator responsible for managing job postings and platform metrics.

#### Use Cases (User)
* **Register / Login**: Secure authentication into the platform.
* **Upload Resume**: Uploading a PDF resume for AI parsing and text extraction.
* **View Score**: Checking the ATS-readiness score or the specific match score against a job.
* **Get Suggestions**: Receiving actionable, rule-based feedback to improve resume quality.
* **View Jobs**: Browsing active job postings or seeing algorithmically matched jobs.
* **Save Jobs**: Bookmarking jobs for later application.

#### Use Cases (Admin)
* **Manage Jobs**: Performing CRUD operations (Create, Read, Update, Delete) on job postings.
* **View Analytics**: Monitoring platform usage, applicant counts, and overall system health.
