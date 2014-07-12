@echo off

REM Install everything
SET rootdir=%~dp0
SET rootdir="%rootdir%/../"
cd "%rootdir%"

REM Make sure we have node
where node >nul 2>&1 && (
    npm install "%ROOTDIR%"
    node "%ROOTDIR%/src/scripts/install.js"
    exit /B %ERRORLEVEL%
) || (
    echo Missing node.
    exit /b 1
)
