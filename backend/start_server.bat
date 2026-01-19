@echo off
REM Activate virtual environment and start Django server
call venv\Scripts\activate.bat
python manage.py runserver
