# Setup Maven Script
$ErrorActionPreference = "Stop"

$mavenVersion = "3.9.6"
$mavenHome = "C:\apache-maven-$mavenVersion"

Write-Host "Setting up Maven $mavenVersion..." -ForegroundColor Green

# Check if already installed
if (Test-Path $mavenHome) {
    Write-Host "Maven already exists at $mavenHome" -ForegroundColor Yellow
} else {
    Write-Host "Please download Maven manually from:"
    Write-Host "https://dlcdn.apache.org/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip"
    Write-Host ""
    Write-Host "Then extract it to: $mavenHome"
    Write-Host ""
    Write-Host "Or use this command in PowerShell (run as Administrator):"
    Write-Host "Invoke-WebRequest -Uri 'https://dlcdn.apache.org/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip' -OutFile 'C:\apache-maven.zip'; Expand-Archive -Path 'C:\apache-maven.zip' -DestinationPath 'C:\' -Force"
}

Write-Host ""
Write-Host "After Maven is installed, run your backend with:"
Write-Host "cd backend"
Write-Host "C:\apache-maven-$mavenVersion\bin\mvn.cmd spring-boot:run"
