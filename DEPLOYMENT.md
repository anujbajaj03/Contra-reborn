# Deploying Contra-Reborn to Google Cloud Run

Follow these steps to deploy the game to Google Cloud Run.

## Prerequisites
1.  **Google Cloud SDK**: Ensure `gcloud` is installed and initialized.
2.  **Docker**: (Optional) Use Cloud Build to build the image remotely if you don't have Docker locally.

## Steps

### 1. Initialize Google Cloud Project
Open your terminal and run:
`gcloud init`
Select your project and configuration.

### 2. Enable Required Services
Enable Cloud Run and Cloud Build APIs:
`gcloud services enable run.googleapis.com cloudbuild.googleapis.com`

### 3. Build and Deploy
Run the following command from the project root (`contra-reborn` directory) to build the container image and deploy it to Cloud Run in one step:

`gcloud run deploy contra-reborn --source . --platform managed --region us-central1 --allow-unauthenticated`

- **--source .**: Uses the current directory (and the Dockerfile inside it) to build the image.
- **--platform managed**: Deploys to the fully managed Cloud Run platform.
- **--region us-central1**: Sets the region (you can change this to your preferred region).
- **--allow-unauthenticated**: Makes the game publicly accessible.

### 4. Play!
Once the deployment finishes, the command will output a **Service URL**. Open that link in your browser to play the game!

## Troubleshooting
If you encounter execution policy errors in PowerShell (e.g., "running scripts is disabled"), try running the commands in **Command Prompt (cmd.exe)** or **Git Bash** instead.
