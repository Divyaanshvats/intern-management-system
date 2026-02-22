# Git Upload Checklist

Follow these steps to push your project to GitHub:

1. **Initialize Git**
   ```powershell
   git init
   ```

2. **Add Files**
   ```powershell
   git add .
   ```

3. **First Commit**
   ```powershell
   git commit -m "Initial commit for Vercel deployment"
   ```

4. **Link to GitHub**
   - Create a **New Repository** on [GitHub](https://github.com/new) (name it `intern-management-system`).
   - Run the commands GitHub shows you:
   ```powershell
   git branch -M main
   git remote add origin https://github.com/[YOUR-USERNAME]/intern-management-system.git
   git push -u origin main
   ```
