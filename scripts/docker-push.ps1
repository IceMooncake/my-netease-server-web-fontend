param(
    [string]$SourceImage = "minecraft-qq-backend:latest",
    [string]$TargetImage = "icemooncake/mc-qq-fontend:v1.0",
    [string]$BuildContext = ".",
    [string]$DockerfilePath = "Dockerfile",
    [switch]$SkipBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $SkipBuild) {
    Write-Host "Building: $SourceImage (context: $BuildContext, dockerfile: $DockerfilePath)"
    docker build -t $SourceImage -f $DockerfilePath $BuildContext
} else {
    Write-Host "Skipping build."
}

Write-Host "Tagging: $SourceImage -> $TargetImage"
docker tag $SourceImage $TargetImage

Write-Host "Pushing: $TargetImage"
docker push $TargetImage

Write-Host "Done."
