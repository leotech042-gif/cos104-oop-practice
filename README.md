# COS 104 · Computing Practice (C++ OOP)

Mini exam & practice site for **COS 104 Computing Practice**.

## Features

- **Dashboard** – progress overview, syllabus snapshot  
- **Practice** – filter by difficulty (Easy / Medium / Hard / Very Hard) and topic; instant answer + step-by-step breakdown  
- **Exam** – timed mixed sets, results saved locally  
- **Performance** – accuracy by difficulty & topic, recent exam history  

Questions are derived from the course PDF (classes, encapsulation, abstraction, inheritance, polymorphism, reference types, function overloading, copy constructor, templates, virtual functions, virtual base classes / diamond problem, exception handling) plus external interview/quiz material.

## Deploy to Vercel

1. Push this folder to a GitHub repo  
2. Import the repo in [vercel.com](https://vercel.com)  
3. Framework preset: **Other** (static)  
4. Deploy – root directory is this folder  

Or from CLI:

```bash
npx vercel
```

## Local

Just open `index.html` in a browser, or:

```bash
npx serve .
```

Progress is stored in `localStorage` (key `cos104_progress_v1`).
