@echo off
set /p pkg="Enter pkg name: "

ECHO ###########################################
ECHO Building %pkg% (Debug, x86_64, VS15, MDd)
conan install %pkg% --build=missing --update -s build_type=Debug -s arch=x86_64 -s compiler="Visual Studio" -s compiler.version="15" -s compiler.runtime=MDd
ECHO ###########################################
ECHO Building %pkg% (Release, x86_64, VS15, MD)
conan install %pkg% --build=missing  --update -s build_type=Release -s arch=x86_64 -s compiler="Visual Studio" -s compiler.version="15" -s compiler.runtime=MD
ECHO ###########################################
ECHO Building %pkg% (Debug, x86_64, VS14, MDd)
conan install %pkg% --build=missing --update -s build_type=Debug -s arch=x86_64 -s compiler="Visual Studio" -s compiler.version="14" -s compiler.runtime=MDd
ECHO ###########################################
ECHO Building %pkg% (Release, x86_64, VS14, MD)
conan install %pkg% --build=missing --update -s build_type=Release -s arch=x86_64 -s compiler="Visual Studio" -s compiler.version="14" -s compiler.runtime=MD
ECHO ###########################################
ECHO Build Completed

set /p upload="Upload to artifactory? Y[es] or N[o] "
IF /I "%upload%"=="Y" (SET upload=Yes)
IF /I "%upload%"=="N" (SET upload=No)
IF "%upload%"=="Yes" (
	ECHO ###########################################
	ECHO Uploading to asdc-artifactory
	conan upload %pkg% --all -r=asdc-artifactory
)
pause
