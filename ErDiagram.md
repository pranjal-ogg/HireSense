# HireSense Entity-Relationship (ER) Diagram

The following diagram maps out the database schema, illustrating the entities, their properties, primary/foreign keys, and their cardinality.

```mermaid
erDiagram
    %% ─── Entities ──────────────────────────────────────────

    USER {
        ObjectId _id PK "Primary Key"
        String name
        String email "Unique Index"
        String password
        String role "user | admin | recruiter"
        Boolean isActive
        Date createdAt
    }

    RESUME {
        ObjectId _id PK "Primary Key"
        ObjectId userId FK "Ref: USER"
        String originalFileName
        String parseStatus
        Object parsedData "Skills, Experience, Education"
        Date createdAt
    }

    JOB {
        ObjectId _id PK "Primary Key"
        ObjectId postedBy FK "Ref: USER (Recruiter/Admin)"
        String title
        String company
        Object requirements "Required Skills, Experience"
        String status "active | draft | closed"
        Date createdAt
    }

    APPLICATION {
        ObjectId _id PK "Primary Key"
        ObjectId jobId FK "Ref: JOB"
        ObjectId applicantId FK "Ref: USER"
        ObjectId resumeId FK "Ref: RESUME"
        String status "applied | shortlisted | rejected"
        Number matchScore "Snapshot of AI match at application time"
        Date appliedAt
    }

    %% ─── Relationships ──────────────────────────────────────

    %% 1-to-Many: A user can upload multiple resumes
    USER ||--o{ RESUME : "uploads"

    %% 1-to-Many: A recruiter/admin can post multiple jobs
    USER ||--o{ JOB : "posts"

    %% M-to-N Join Table (Application): 
    %% An application belongs to exactly one User, Job, and Resume.
    %% A User can have many Applications.
    %% A Job can have many Applications.
    %% A Resume can be used in many Applications.
    
    USER ||--o{ APPLICATION : "submits"
    JOB ||--o{ APPLICATION : "receives"
    RESUME ||--o{ APPLICATION : "used_in"
```

### Relationship Breakdown

* **USER to RESUME (1:N)**: A single `User` (Candidate) can upload multiple `Resumes` over time tailored for different roles.
* **USER to JOB (1:N)**: A single `User` (acting as a Recruiter or Admin) can post multiple `Jobs`.
* **Many-to-Many Resolution (APPLICATION)**:
  * The `APPLICATION` entity acts as a junction (join table) resolving the Many-to-Many relationship between `USER` and `JOB`.
  * It records that a specific **Candidate** applied to a specific **Job** on a specific date, and it inherently references the specific **Resume** they chose to use for that application.
  * We enforce a compound unique index on `{ jobId, applicantId }` inside the application schema to prevent a user from applying to the exact same job twice.
