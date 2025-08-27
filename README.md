# 🩸 Blood Group Analyzer 🧬

<p align="center">
  <img src="https://media.giphy.com/media/UvE0a2m6aIsQo/giphy.gif" alt="Blood cells animation" width="80%">
</p>

<p align="center">
  <strong>A cutting-edge web application that deciphers the complexities of blood type genetics and transfusion compatibility, supercharged by the Google Gemini AI and a stunning, interactive user interface.</strong>
</p>

<p align="center">
  <a href="https://react.dev/" target="_blank">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  </a>
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  </a>
  <a href="https://tailwindcss.com/" target="_blank">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  </a>
  <a href="https://ai.google.dev/gemini-api" target="_blank">
    <img src="https://img.shields.io/badge/Gemini_API-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini API">
  </a>
</p>

---

## 🚀 Live Demo

This project is best experienced firsthand. Click the link below to explore its full capabilities.

**[✨ LAUNCH THE APPLICATION ✨](https://main--blood-group-analyzer.lab-pro.app.aiprompt.dev/)**

---

## 📸 Visual Showcase

| Input Form with 3D Tilt Effect | Detailed Results with Interactive Charts | AI-Powered Genetic Error Explanation |
| :-----------------------------: | :---------------------------------------: | :-----------------------------------: |
| <img src="https://i.imgur.com/uR2B4xO.png" alt="Input Form" width="100%"> | <img src="https://i.imgur.com/1Gj2sZL.png" alt="Results Display" width="100%"> | <img src="https://i.imgur.com/rN5wR4d.png" alt="AI Error Explanation" width="100%"> |

| AI Assistant "Geno" | Educational Section | Bilingual Support (Farsi) |
| :------------------: | :------------------: | :------------------------: |
| <img src="https://i.imgur.com/XwSjBq0.png" alt="AI Assistant" width="100%"> | <img src="https://i.imgur.com/0F9kKz8.png" alt="How It Works Section" width="100%"> | <img src="https://i.imgur.com/0P6Bq9o.png" alt="Farsi Language UI" width="100%"> |

---

## 🌟 Core Features

-   **🧬 Precision Genetic Engine:**
    -   Leverages **Mendelian inheritance** to analyze family blood types (both ABO and RH systems).
    -   Accurately calculates the probability of every possible **phenotype** (e.g., A+) and **genotype** (e.g., AO/Dd) for each family member, even with incomplete information.
    -   Intelligently detects and explains genetic impossibilities in family combinations.

-   **🩸 Advanced Transfusion Analysis:**
    -   Goes beyond simple compatibility charts by calculating the *probability* of compatibility for donations and receptions.
    -   This is crucial when a person's exact blood type is unknown; the app weighs all possibilities to give a percentage-based compatibility score.

-   **🤖 "Geno" - The AI Blood Expert:**
    -   Powered by **Google's `gemini-2.5-flash` model**, Geno provides context-aware explanations for your results.
    -   Ask it anything from "Why is my child's genotype probability 50% AO?" to "Explain the Punnett Square for me."
    -   If the app detects a genetic impossibility, Geno will provide a detailed, easy-to-understand explanation of why the combination is invalid.

-   **🎨 Immersive & Interactive UI/UX:**
    -   A visually rich interface with **interactive glow and 3D tilt effects** on cards that respond to your cursor.
    -   Features stunning **custom animations**, including a satisfying "blob" button, animated icons, and smooth transitions that make the experience engaging and fun.
    -   Data is brought to life with animated, interactive pie charts and progress bars.

-   **🎓 Integrated Learning Hub:**
    -   A dedicated "How It Works" section breaks down complex topics into easy-to-digest visual guides.
    -   Explore interactive diagrams of **Punnett squares**, transfusion rules, and the mathematical formulas powering the analysis.

-   **🌍 Fully Bilingual:**
    -   Seamlessly switch between **English** and **Persian (Farsi)** with full UI and AI response localization. The app automatically detects text direction (LTR/RTL).

---

## ⚙️ How It Works: The Analysis Pipeline

The application follows a sophisticated pipeline to turn raw user input into insightful, AI-powered analysis.

| Step | Process | Description |
| :--: | --- | --- |
| **1** | **Data Input & Validation** | The user enters known blood types for family members. The system validates these inputs, accepting phenotypes (like `A+`), genotypes (`AO Dd`), or `Unknown`. |
| **2** | **Genetic Combination Generation** | The core logic engine generates every possible valid genetic combination for the family based on the laws of Mendelian inheritance. It cross-references parent alleles to determine all potential offspring genotypes. |
| **3** | **Probability Calculation** | The app analyzes the pool of valid combinations to calculate the precise percentage probability for every possible genotype and phenotype for each family member. Children's probabilities are weighted based on Punnett square outcomes from all valid parent pairings. |
| **4** | **Transfusion Logic** | Using the calculated phenotype probabilities, the engine determines transfusion compatibility. It computes a weighted average of compatibility across all potential blood types for a person. |
| **5** | **Data Visualization** | The calculated results are rendered in interactive pie charts (using Recharts), sortable tables, and clear summary cards for an intuitive user experience. |
| **6** | **AI-Powered Explanation** | If a genetic conflict is found, or if the user requests more information, the relevant data is sent to the **Google Gemini API** with a carefully crafted system prompt. The AI then generates a natural language explanation tailored to the user's specific scenario. |

---

## 🛠️ Tech Stack Deep Dive

This project was built with a focus on performance, modern development practices, and a rich user experience.

| Category | Technology | Purpose & Rationale |
| :--- | :--- | :--- |
| **Core Framework** | [![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/) | Chosen for its component-based architecture, enabling the creation of a modular and highly manageable user interface. |
| **Language** | [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) | Ensures code quality, maintainability, and type safety, which is critical for the complex genetic logic. |
| **Styling** | [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) | A utility-first CSS framework that allows for rapid and consistent UI development. Complemented by custom CSS for advanced animations and visual effects. |
| **AI Integration** | [![Gemini API](https://img.shields.io/badge/Gemini_API-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/gemini-api) | The `gemini-2.5-flash` model provides fast, high-quality, and context-aware natural language explanations for genetic results and user queries. |
| **Data Visualization** | [![Recharts](https://img.shields.io/badge/Recharts-8884d8?style=flat-square)](https://recharts.org/) | A powerful and declarative charting library for React, used to create the beautiful and interactive pie charts. |
| **Module Loading** | [![esm.sh](https://img.shields.io/badge/esm.sh-000000?style=flat-square)](https://esm.sh/) | A modern, fast, global CDN for ES Modules. This approach eliminates the need for a local build step or `node_modules`, simplifying the development setup. |

---

## 📞 Contact Me

Feel free to reach out with any questions, feedback, or collaboration ideas!

-   **GitHub:** [@parsa83KH](https://github.com/parsa83KH)
-   **Email:** `parsakhosravani83@gmail.com`
-   **Telegram:** [@ParsaKH_83](https://t.me/ParsaKH_83)

---

## 📜 License

This project is licensed under the MIT License.
