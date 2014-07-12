@echo off

REM Run everything
SET rootdir=%~dp0
SET rootdir="%rootdir%/../"
cd "%rootdir%"

REM Make sure we have node
where node >nul 2>&1 && (
    node "%ROOTDIR%/src/frontend/index.js"
    exit /B %ERRORLEVEL%
) || (
    echo Missing node.
    exit /b 1
)
