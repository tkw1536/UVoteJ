@echo off

REM Make sure we can develop

REM Check if we have git
where git >nul 2>&1 && (
    REM Found git
) || (
    echo Missing git.
    exit /b 1
)

REM Make sure we have node
where node >nul 2>&1 && (
    <nul set /p =Node:
    node --version
) || (
    echo Missing node.
    exit /b 1
)

REM Make sure we have jsdoc
where jsdoc >nul 2>&1 && (
    <nul set /p =JSDoc:
    jsdoc --version
) || (
    echo Missing jsdoc. Install via:
    echo     npm install -g jsdoc
)

<nul set /p =Checking submodules ...
git submodule init
git submodule update

echo Done.
