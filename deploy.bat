@echo off
echo Deploying to Netlify...

cd client
npm run netlify-build
cd ..

echo Build completed. Please commit and push these changes to GitHub.
echo Netlify will automatically deploy the updated site.
pause
