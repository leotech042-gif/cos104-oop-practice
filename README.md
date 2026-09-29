# COS 104 · Computing Practice (C++ OOP)

Mini exam & practice site for **COS 104 Computing Practice**.

**Live repo:** https://github.com/leotech042-gif/cos104-oop-practice

## Features

- **Dashboard** – progress, accuracy, syllabus snapshot  
- **Practice** – choose **10–60** questions (clamped to bank size), filters by difficulty/topic, **always shuffled**, answer + full breakdown  
- **Exam** – timed sets of **10–60** questions, shuffled, results saved  
- **Performance** – accuracy by difficulty & topic, recent sessions (localStorage)

## Question bank

Mixed **Easy / Medium / Hard / Very Hard** covering:

Classes, Encapsulation, Abstraction, Inheritance, Polymorphism, Reference types, Function overloading, Copy constructor, Templates, Virtual functions, Virtual base classes (Diamond problem), Smart pointers, Exception handling / RAII.

## Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**  
2. Import **leotech042-gif/cos104-oop-practice**  
3. Framework preset: **Other** (static HTML)  
4. Deploy — root is the repo root  

Or:

```bash
npx vercel
```

## Local

Open `index.html` in a browser, or:

```bash
npx serve .
```

Progress is stored in `localStorage` under `cos104_progress_v1`.
