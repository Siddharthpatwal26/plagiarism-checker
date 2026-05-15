# Plagiarism Checker - VS Code Integration

You can now run this project directly from VS Code without manual CMD terminals.

## Option 1: VS Code Tasks (Recommended for Multi-Terminal)
1. Press `Ctrl + Shift + P` (Command Palette).
2. Type `Tasks: Run Task`.
3. Select **"Start All Services"**.
   - This will open **three separate terminal tabs** inside VS Code for:
     - Backend (Node.js)
     - Frontend (React)
     - ML Service (Python)

## Option 2: Run and Debug (One Button Click)
1. Go to the **Run and Debug** side bar (`Ctrl + Shift + D`).
2. Select **"Full App (All Services)"** from the dropdown.
3. Click the **Play (Green Arrow)** button.
   - This uses `concurrently` to run everything in a single VS Code terminal.

## Option 3: Terminal Command
Run this in any VS Code terminal:
```bash
npm run dev
```

---
*Note: Ensure you have Node.js and Python installed and added to your PATH.*
